import Node from "components/Node.vue";
import Spacer from "components/layout/Spacer.vue";
import { createResource, trackBest, trackOOMPS, trackTotal } from "features/resources/resource";
import { branchedResetPropagation, createTree, Tree } from "features/trees/tree";
import type { Layer } from "game/layers";
import { createLayer } from "game/layers";
import { noPersist } from "game/persistence";
import player, { Player } from "game/player";
import type { DecimalSource } from "util/bignum";
import Decimal, { format, formatTime } from "util/bignum";
import { render, Renderable } from "util/vue";
import { computed, toRaw, unref } from "vue";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createTabFamily } from "features/tabs/tabFamily";
import { createTab } from "features/tabs/tab";
import { createReset, Reset } from "features/reset";
import { createSequentialModifier, createAdditiveModifier, createMultiplicativeModifier } from "game/modifiers";
import { createCollapsibleModifierSections, createLayerTreeNode, createResetButton } from "./common";
import { createUpgrade, Upgrade, UpgradeOptions } from "features/clickables/upgrade";
import { createCostRequirement } from "game/requirements";
import { globalBus } from "game/events";
import settings, { registerSettingField } from "game/settings";
import Select from "components/fields/Select.vue";
import { Difficulty, difficultyOptions, msDisplayOptions } from "features/achievements/achievement";
import Toggle from "components/fields/Toggle.vue";
import { create } from "domain";
import { createCumulativeConversion } from "features/conversion";
import { addTooltip } from "wrappers/tooltips/tooltip";
import { createHotkey } from "features/hotkey";
import { createRepeatable, RepeatableOptions } from "features/clickables/repeatable";

/**
 * @hidden
 */
export const main = createLayer("main", layer => {
    const money = createResource<DecimalSource>(10, "money");

    const moneyGain = computed(() => {
        let gain = new Decimal(0);

        // Calculate base gain
        // First, apply additive bonuses
        if (prestige.upgrades[1].bought.value) gain = gain.add(1);

        // Then apply multiplicative bonuses
        gain = gain.times(new Decimal(1.25).pow(prestige.upgrades[2].amount.value));
        if (prestige.upgrades[3].bought.value) gain = gain.times(2);
        gain = gain.times(new Decimal(1.2).pow(prestige.upgrades[4].amount.value));

        return gain;
    });

    const gainDisplay = trackOOMPS(money, moneyGain)


    const layerColor = "#eff7ff";

    const gameSpeed = computed(() => {
        let speed = 1;

        if (settings.difficulty === Difficulty.NotSet) speed = 0; // Pause game if difficulty is not set to avoid issues

        // Apply modifiers based on difficulty
        if (settings.difficulty === Difficulty.Easy) speed = speed * 3
        if (settings.difficulty === Difficulty.Hard) speed = speed / 2
        if (settings.difficulty === Difficulty.VeryHard) speed = speed / 5
        if (settings.difficulty === Difficulty.Impossible) speed = speed / 20

        return speed;
    });

    layer.on("update", diff => {
        player.devSpeed = gameSpeed.value;
        money.value = Decimal.add(money.value, moneyGain.value.times(diff));
    });

    const tabs = createTabFamily({
        mainTab: () => ({
            tab: createTab(() => ({
                display: () => (
                    <>
                        {
                            settings.difficulty === Difficulty.NotSet ? (
                                <div>
                                    <h2>Select a Difficulty</h2><br></br>
                                    Before you start, please select a difficulty level for the game. This will affect the overall challenge and experience.<br></br>
                                    You can find the difficulty options in the settings menu.
                                </div>
                            ) : null
                        }
                        
                        <Spacer />
                    </>
                )
            })),
            display: "Main"
        }),
        treeTab: () => ({
            tab: createTab(() => ({
                display: () => (
                    <>
                        <h2>Tree</h2>
                        {render(tree)}
                    </>
                )
            })),
            display: "Tree"
        }),
    });

    const tree: Tree = createTree(() => ({
        nodes: noPersist([ // All gameplay layers (e.g. prestige)
            [prestige.treeNode]
        ]),
        leftSideNodes: noPersist([]), // Other layers (e.g. achievements)
        branches: [],
        onReset() {
            money.value = toRaw(tree.resettingNode.value) !== toRaw(prestige.treeNode) ? 10 : 0; // Set money to 10 if not prestige (because the first upgrade requires a prestige point, which requires 10 money)
        },
        resetPropagation: branchedResetPropagation,
    }));

    const reset: Reset = createReset(() => ({
        thingsToReset: noPersist([])
    }));

    return {
        name: "Main",
        color: layerColor,
        tabs,
        reset,
        display: () => (
            <>
                {player.devSpeed === 0 ? (
                    <div>
                        Game Paused<br></br>
                        ---------------------------------------------------
                        <Node id="paused" />
                    </div>
                ) : null}
                {player.devSpeed != null && player.devSpeed !== 0 && player.devSpeed !== 1 ? (
                    <div>
                        Speed: {format(player.devSpeed)}x<br></br>
                        ---------------------------------------------------
                        <Node id="devspeed" />
                    </div>
                ) : null}
                {player.offlineTime != null && player.offlineTime !== 0 ? (
                    <div>
                        Offline Time: {formatTime(player.offlineTime)}<br></br>
                        ---------------------------------------------------
                        <Node id="offline" />
                    </div>
                ) : null}
                <div>
                    {new Decimal(money.value).lte(new Decimal("ee1000")) ? "You have " : null}
                    <h2 style={{"text-shadow": "0px 0px 10px " + layerColor, "color": layerColor}}>{format(money.value)}</h2>
                    {new Decimal(money.value).lte(new Decimal("eeee1000")) ? " money" : null}<br></br>
                    ---------------------------------------------------<br></br>
                    {gainDisplay.value}
                </div>
                <Spacer />
                {render(tabs)}
            </>
        ),
        money,
        moneyGain,
        gainDisplay,
        gameSpeed,

        tree,

        minimizedDisplay: () => (
            <div style={{ fontSize: "35px" }}>
                Main | <span style={{"text-shadow": "0px 0px 10px " + layerColor, "color": layerColor}}>{format(money.value)}</span> money | {gainDisplay.value}
            </div>
        )
    };
});

export const prestige = createLayer("P", layer => {
    const layerColor = "#4bdc13";

    const points = createResource<DecimalSource>(0, "prestige points");

    const gain = computed(() => {
        let gain = new Decimal(0);

        if (upgrades[5].bought.value) gain = gain.add(new Decimal(unref(conversion.actualGain)).times(0.1))

        return gain;
    });

    const gainDisplay = trackOOMPS(points, gain);

    const tabs = createTabFamily({
        mainTab: () => ({
            tab: createTab(() => ({
                display: () => (
                    <>
                        <h2>Prestige</h2><br></br>
                        ---------------------------------------------------<br></br>
                        <Node id="prestige" />
                        {render(resetButton)}
                        <Spacer />
                    </>
                )
            })),
            display: "Prestige"
        }),
        upgradesTab: () => ({
            tab: createTab(() => ({
                display: () => (
                    <>
                        <h2>Upgrades</h2><br></br>
                        ---------------------------------------------------<br></br>
                        <div style={{ display: "flex", flexDirection: "row", width: "min-content", gap: "5px" }}>
                            {
                                Object.entries(upgrades).map(([key, upgrade]) => {
                                    return (
                                        <div>
                                            {render(upgrade)}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <Spacer />
                    </>
                )
            })),
            display: "Upgrades"
        }),
    });

    const mult = computed(() => {
        let mult = new Decimal(1);

        mult = mult.times(new Decimal(1.2).pow(prestige.upgrades[4].amount.value));

        return mult;
    })

    const conversion = createCumulativeConversion(() => ({
        formula: x => x.div(10).sqrt().times(mult),
        baseResource: main.money,
        gainResource: noPersist(points)
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [prestige]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: "P",
        color: layerColor,
        reset
    }));

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode,
        resetDescription: "Prestige for "
    }));

    const hotkey = createHotkey(() => ({
        description: "Reset for prestige points",
        key: "p",
        onPress: resetButton.onClick!
    }));


    const upgrades = {
        1: createUpgrade((): UpgradeOptions => ({
            display: {
                title: "Start",
                description: "Gain 1 money per second.",
                effectDisplay: () => "+1 money/s",
            },
            requirements: [
                createCostRequirement(() => ({
                    cost: 1,
                    resource: noPersist(points)
                }))
            ]
        })),
        2: createRepeatable((): RepeatableOptions => {
            const amount = computed(() => upgrades[2]?.amount?.value ?? 0) // Reactive reference to amount
            return {
                display: {
                    title: "Money Maker",
                    description: "Increase money gain by 25% per level.",
                    effectDisplay: () => `x${format(new Decimal(1.25).pow(amount.value))} money/s`,
                },
                requirements: [
                    createCostRequirement(() => ({
                        cost: () => new Decimal(1.5).pow(amount.value).times(2).floor(),
                        resource: noPersist(points)
                    }))
                ],
                limit: 25,
            }
        }),
        3: createUpgrade((): UpgradeOptions => ({
            display: {
                title: "Money Multiplier",
                description: "Increase money gain by 2x.",
                effectDisplay: () => `x2 money/s`,
            },
            requirements: [
                createCostRequirement(() => ({
                    cost: 10,
                    resource: noPersist(points)
                }))
            ]
        })),
        4: createRepeatable((): RepeatableOptions => {
            const amount = computed(() => upgrades[4]?.amount?.value ?? 0) // Reactive reference to amount
            return {
                display: {
                    title: "Double Boost",
                    description: "Increase prestige point and money gain by 20% per level.",
                    effectDisplay: () => `x${format(new Decimal(1.2).pow(amount.value))} prestige points | money/s`,
                },
                requirements: [
                    createCostRequirement(() => ({
                        cost: () => new Decimal(2).pow(amount.value).times(20).floor(),
                        resource: noPersist(points)
                    }))
                ],
                limit: 10,
            }
        }),
        5: createUpgrade((): UpgradeOptions => ({
            display: {
                title: "Prestige Point Generator",
                description: "Gain 10% of prestige points gained on reset per second.",
                effectDisplay: () => `+${format(new Decimal(unref(conversion.actualGain)).times(0.1))} prestige points/s`,
            },
            requirements: [
                createCostRequirement(() => ({
                    cost: 100,
                    resource: noPersist(points)
                }))
            ]
        })),
        6: createUpgrade((): UpgradeOptions => ({
            display: {
                title: "Unlock I",
                description: "Unlocks the next tab."
            },
            requirements: [
                createCostRequirement(() => ({
                    cost: 1000,
                    resource: noPersist(points)
                }))
            ]
        })),
    }

    layer.on("update", diff => {
        points.value = Decimal.add(points.value, gain.value.times(diff));
    });

    return {
        name: "Prestige",
        color: layerColor,
        tabs,
        display: () => (
            <>
                <div>
                    {new Decimal(points.value).lte(new Decimal("ee1000")) ? "You have " : null}
                    <h2 style={{"text-shadow": "0px 0px 10px " + layerColor, "color": layerColor}}>{format(points.value)}</h2>
                    {new Decimal(points.value).lte(new Decimal("eeee1000")) ? " prestige points" : null}<br></br>
                    ---------------------------------------------------<br></br>
                    {gainDisplay.value}
                </div>
                <Node id="prestige" />
                <Spacer />
                {render(resetButton)} {/* Quick access to the reset button for the player */}
                {render(tabs)}
            </>
        ),
        points,
        conversion,
        reset,
        treeNode,
        resetButton,
        hotkey,
        upgrades,
        gain,

        minimizedDisplay: () => (
            <div style={{ fontSize: "35px" }}>
                Prestige | <span style={{"text-shadow": "0px 0px 10px " + layerColor, "color": layerColor}}>{format(points.value)}</span> PP | {gainDisplay.value}
            </div>
        )
    }
})

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<Layer> => [main, prestige];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */

globalBus.on("setupVue", () => {
    registerSettingField(() => (
        <Select
            title={
                <span class="option-title">
                    Difficulty
                    <desc>Select the difficulty level for the game.</desc>
                </span>
            }
            options={difficultyOptions}
            onUpdate:modelValue={value => (settings.difficulty = value as Difficulty)}
            modelValue={settings.difficulty}
        />
    ));
});