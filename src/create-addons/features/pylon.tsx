import { RepeatableOptions } from "features/clickables/repeatable";
import { computed, ComputedRef, MaybeRef, MaybeRefOrGetter, Ref, unref } from "vue";
import Decimal, { DecimalSource, formatWhole } from "util/bignum";
import { isJSXElement, Renderable, VueFeature, vueFeatureMixin, render } from "util/vue";
import {
    displayRequirements,
    maxRequirementsMet,
    requirementsMet,
    Requirements,
    payRequirements
} from "game/requirements";
import { persistent, Persistent } from "game/persistence";
import { MaybeGetter, processGetter } from "util/computed";
import { createLazyProxy } from "util/proxies";
import Clickable from "features/clickables/Clickable.vue";
import { createVisibilityRequirement } from "game/requirements";
import { findFeatures, Visibility } from "features/feature";
import { Unsubscribe } from "nanoevents";
import { globalBus } from "game/events";
import { bonusAmountMixin } from "mixins/bonusAmount";

/** A symbol used to identify {@link Pylon} features. */
export const PylonType = Symbol("Pylon");

//#region Interfaces
/** An object that configures a {@link Pylon}. */
export interface PylonOptions extends RepeatableOptions {
    /** The resource that the pylon is increasing. */
    target?: Ref<DecimalSource>;
    /** The amount of the target to increase per second, per pylon. */
    gain: MaybeRefOrGetter<DecimalSource>;
    /** The display to use for this pylon. */
    display?:
        | MaybeGetter<Renderable>
        | {
              /** A header to appear at the top of the display. */
              title?: MaybeGetter<Renderable>;
              /** The main text that appears in the display. */
              description: MaybeGetter<Renderable>;
              /** The name of the target resource. */
              targetName: MaybeGetter<Renderable>;
              /** Whether or not to show the current amount of this repeatable at the bottom of the display. */
              showAmount?: boolean;
          };
}

/** An object that represents a feature with multiple "levels" with scaling requirements, and that produces a resource. */
export interface Pylon extends VueFeature {
    /** The requirement(s) to increase this pylon. */
    requirements: Requirements;
    /** The maximum amount obtainable for this pylon. */
    limit: MaybeRef<DecimalSource>;
    /** The initial amount this pylon has on a new save / after reset. */
    initialAmount?: DecimalSource;
    /** The display to use for this pylon. */
    display?: MaybeGetter<Renderable>;
    /** Whether or not the pylon may be clicked. */
    canClick: Ref<boolean>;
    /** A function that is called when the pylon is clicked. */
    onClick: (event?: MouseEvent | TouchEvent) => void;
    /** The current amount this pylon has. */
    amount: Persistent<DecimalSource>;
    /** The current amount this pylon has had generated, usually from other pylons. */
    generated: Persistent<DecimalSource>;
    /** Whether or not this pylon's amount is at it's limit. */
    maxed: Ref<boolean>;
    /** How much amount can be increased by, or 1 if unclickable. **/
    amountToIncrease: Ref<DecimalSource>;
    /** The effect of the pylon. Can be used if target is not set. **/
    effect: ComputedRef<DecimalSource>;
    /** The resource that the pylon is increasing. */
    target?: Ref<DecimalSource>;
    /** The amount of the target to increase per second. */
    gain: MaybeRefOrGetter<DecimalSource>;
    /** A symbol that helps identify features of the same type. */
    type: typeof PylonType;
}
//#endregion

//#region createPylon
/**
 * Lazily creates an pylon with the given options.
 * @param optionsFunc Pylon options.
 */
export function createPylon<T extends PylonOptions>(optionsFunc: () => T) {
    const amount = persistent<DecimalSource>(0);
    const generated = persistent<DecimalSource>(0);
    return createLazyProxy(() => {
        const options = optionsFunc();
        const {
            requirements: _requirements,
            display: _display,
            target,
            limit,
            gain,
            onClick,
            ...props
        } = options;

        if (options.classes == null) {
            options.classes = computed(() => ({ bought: unref(pylon.maxed), pylon: true }));
        } else {
            const classes = processGetter(options.classes);
            options.classes = computed(() => ({
                ...unref(classes),
                bought: unref(pylon.maxed),
                pylon: true
            }));
        }

        const vueFeature = vueFeatureMixin("pylon", options, () => (
            <Clickable
                canClick={pylon.canClick}
                onClick={pylon.onClick}
                onHold={pylon.onClick}
                display={pylon.display}
            />
        ));

        const limitRequirement = {
            requirementMet: computed(
                (): DecimalSource => Decimal.sub(unref(pylon.limit), unref(amount))
            ),
            requiresPay: false,
            visibility: Visibility.None,
            canMaximize: true
        } as const;
        const requirements: Requirements = [
            ...(Array.isArray(_requirements) ? _requirements : [_requirements]),
            limitRequirement
        ];
        if (vueFeature.visibility != null) {
            requirements.push(createVisibilityRequirement(vueFeature.visibility));
        }

        let display;
        if (typeof _display === "object" && !isJSXElement(_display)) {
            const { title, description, targetName, showAmount } = _display;

            display = () => (
                <span>
                    {title == null ? null : (
                        <div>
                            {render(title, el => (
                                <h3>{el}</h3>
                            ))}
                        </div>
                    )}
                    {render(description)}
                    {showAmount === false ? null : (
                        <div>
                            <br />
                            Amount:{" "}
                            {Decimal.gt(unref(pylon.generated), 0) ? (
                                <>{formatWhole(unref(pylon.generated))} [</>
                            ) : undefined}
                            <>{formatWhole(unref(amount))}</>
                            {Decimal.isFinite(unref(pylon.limit)) ? (
                                <> / {formatWhole(unref(pylon.limit))}</>
                            ) : undefined}
                            {Decimal.gt(unref(pylon.generated), 0) ? <>]</> : undefined}
                        </div>
                    )}
                    <div>
                        {formatWhole(pylon.effect.value)} {render(targetName)}/s
                    </div>
                    {unref(pylon.maxed) ? null : (
                        <div>
                            <br />
                            {displayRequirements(requirements, unref(pylon.amountToIncrease))}
                        </div>
                    )}
                </span>
            );
        } else if (_display != null) {
            display = _display;
        }

        const pylon = {
            type: PylonType,
            ...(props as Omit<typeof props, keyof VueFeature | keyof PylonOptions>),
            ...vueFeature,
            amount,
            generated,
            target,
            gain,
            requirements,
            effect: computed<DecimalSource>(
                (): DecimalSource =>
                    Decimal.mul(
                        unref(processGetter(pylon.gain)),
                        bonusAmountMixin(pylon.amount, pylon.generated).totalAmount.value
                    )
            ),
            limit: processGetter(limit) ?? Decimal.dInf,
            classes: computed(() => {
                const currClasses = unref(vueFeature.classes) || {};
                if (unref(pylon.maxed)) {
                    currClasses.bought = true;
                }
                return currClasses;
            }),
            maxed: computed((): boolean => Decimal.gte(unref(amount), unref(pylon.limit))),
            canClick: computed(() => requirementsMet(requirements)),
            amountToIncrease: computed(() => Decimal.clampMin(maxRequirementsMet(requirements), 1)),
            onClick(event?: MouseEvent | TouchEvent) {
                if (!unref(pylon.canClick)) {
                    return;
                }
                const purchaseAmount = unref(pylon.amountToIncrease) ?? 1;
                payRequirements(requirements, purchaseAmount);
                amount.value = Decimal.add(unref(amount), purchaseAmount);
                onClick?.(event);
            },
            display
        } satisfies Pylon;

        return pylon;
    });
}
//#endregion
//#region Listeners
const listeners: Record<string, Unsubscribe | undefined> = {};
globalBus.on("addLayer", layer => {
    const pylons: Pylon[] = findFeatures(layer, PylonType) as Pylon[];
    listeners[layer.id] = layer.on("preUpdate", diff => {
        pylons.forEach(pylon => {
            if (pylon.target) {
                pylon.target.value = Decimal.add(
                    pylon.target.value,
                    Decimal.mul(pylon.effect.value, diff)
                );
            }
        });
    });
});
globalBus.on("removeLayer", layer => {
    listeners[layer.id]?.();
    listeners[layer.id] = undefined;
});
//#endregion
