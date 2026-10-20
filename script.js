
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    /* =====================================================
       1. НАВІГАЦІЯ МІЖ ВКЛАДКАМИ
       ===================================================== */

    const navigationLinks = document.querySelectorAll(
        ".main-navigation [data-tab]"
    );

    const tabs = document.querySelectorAll(".tab-content");

    function openTab(tabId, updateAddress = true) {
        const selectedTab = document.getElementById(tabId);

        if (!selectedTab || !selectedTab.classList.contains("tab-content")) {
            tabId = "home";
        }

        tabs.forEach(function (tab) {
            const isActive = tab.id === tabId;

            tab.classList.toggle("active", isActive);
            tab.hidden = !isActive;
        });

        navigationLinks.forEach(function (link) {
            const isActive = link.dataset.tab === tabId;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        if (updateAddress) {
            const newHash = "#" + tabId;

            if (window.location.hash !== newHash) {
                window.history.pushState(null, "", newHash);
            }
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    navigationLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            openTab(link.dataset.tab);
        });
    });

    // Підтримуємо кнопки браузера «Назад» і «Вперед».
    window.addEventListener("popstate", function () {
        const tabId = window.location.hash.slice(1) || "home";
        openTab(tabId, false);
    });

    // Відкриваємо вкладку з адреси або головну сторінку.
    const initialTab = window.location.hash.slice(1) || "home";
    openTab(initialTab, false);


    /* =====================================================
       2. ДОПОМІЖНІ ФУНКЦІЇ
       ===================================================== */

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined && text !== null) {
            element.textContent = String(text);
        }

        return element;
    }

    function showMessage(elementId, message, type = "") {
        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.textContent = message;
        element.classList.remove("success", "error");

        if (type) {
            element.classList.add(type);
        }
    }

    function readStoredCharacters() {
        try {
            const stored = localStorage.getItem("dndCharacters");
            const characters = stored ? JSON.parse(stored) : [];

            return Array.isArray(characters) ? characters : [];
        } catch (error) {
            console.warn("Не вдалося прочитати персонажів:", error);
            return [];
        }
    }

    function saveCharacters(characters) {
        try {
            localStorage.setItem(
                "dndCharacters",
                JSON.stringify(characters)
            );

            return true;
        } catch (error) {
            console.error("Не вдалося зберегти персонажів:", error);
            showMessage(
                "characterMessage",
                "Не вдалося зберегти дані. Перевір налаштування браузера.",
                "error"
            );

            return false;
        }
    }


    /* =====================================================
       3. CHARACTER SHEETS
       ===================================================== */

    const characterForm = document.getElementById("characterForm");
    const characterList = document.getElementById("characterList");

    let characters = readStoredCharacters();

    function renderCharacters() {
        characterList.replaceChildren();

        if (characters.length === 0) {
            characterList.appendChild(
                createElement("p", "", "Поки що персонажів немає.")
            );
            return;
        }

        characters.forEach(function (character) {
            const card = createElement("article", "item-card");

            card.appendChild(
                createElement("h3", "", character.name)
            );

            card.appendChild(
                createElement("p", "", "Клас: " + character.characterClass)
            );

            card.appendChild(
                createElement("p", "", "Рівень: " + character.level)
            );

            card.appendChild(
                createElement("p", "", "Максимальні HP: " + character.hp)
            );

            const actions = createElement("div", "item-actions");
            const deleteButton = createElement("button", "", "Видалити");

            deleteButton.type = "button";
            deleteButton.addEventListener("click", function () {
                characters = characters.filter(function (item) {
                    return item.id !== character.id;
                });

                if (saveCharacters(characters)) {
                    renderCharacters();

                    showMessage(
                        "characterMessage",
                        "Персонажа видалено.",
                        "success"
                    );
                }
            });

            actions.appendChild(deleteButton);
            card.appendChild(actions);
            characterList.appendChild(card);
        });
    }

    characterForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("characterName").value.trim();
        const characterClass =
            document.getElementById("characterClass").value;
        const level = Number(
            document.getElementById("characterLevel").value
        );
        const hp = Number(
            document.getElementById("characterHP").value
        );

        if (!name || !characterClass) {
            showMessage(
                "characterMessage",
                "Вкажи ім'я персонажа та обери клас.",
                "error"
            );
            return;
        }

        if (
            !Number.isInteger(level) ||
            level < 1 ||
            level > 20 ||
            !Number.isInteger(hp) ||
            hp < 1 ||
            hp > 999
        ) {
            showMessage(
                "characterMessage",
                "Перевір рівень та максимальні HP.",
                "error"
            );
            return;
        }

        const character = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            name: name,
            characterClass: characterClass,
            level: level,
            hp: hp
        };

        characters.push(character);

        if (saveCharacters(characters)) {
            renderCharacters();
            characterForm.reset();
            document.getElementById("characterLevel").value = "1";
            document.getElementById("characterHP").value = "10";

            showMessage(
                "characterMessage",
                "Персонажа успішно створено та збережено.",
                "success"
            );
        } else {
            characters.pop();
        }
    });

    renderCharacters();


    /* =====================================================
       4. BESTIARY
       ===================================================== */

    const monsters = [
        {
            name: "Goblin",
            type: "Humanoid",
            hp: 7,
            ac: 15,
            description: "Маленький хитрий противник, який часто діє групами."
        },
        {
            name: "Skeleton",
            type: "Undead",
            hp: 13,
            ac: 13,
            description: "Неживий воїн, який використовує зброю."
        },
        {
            name: "Orc",
            type: "Humanoid",
            hp: 15,
            ac: 13,
            description: "Сильний противник, схильний до агресивних атак."
        },
        {
            name: "Wolf",
            type: "Beast",
            hp: 11,
            ac: 13,
            description: "Хижак, який полює та може діяти зграєю."
        },
        {
            name: "Owlbear",
            type: "Monstrosity",
            hp: 59,
            ac: 13,
            description: "Велика небезпечна істота з рисами ведмедя та сови."
        },
        {
            name: "Zombie",
            type: "Undead",
            hp: 22,
            ac: 8,
            description: "Повільний неживий противник, який не відступає легко."
        }
    ];

    const monsterSearch = document.getElementById("monsterSearch");
    const monsterList = document.getElementById("monsterList");

    function renderMonsters(searchText = "") {
        monsterList.replaceChildren();

        const query = searchText.trim().toLowerCase();

        const filteredMonsters = monsters.filter(function (monster) {
            return (
                monster.name.toLowerCase().includes(query) ||
                monster.type.toLowerCase().includes(query)
            );
        });

        if (filteredMonsters.length === 0) {
            monsterList.appendChild(
                createElement("p", "", "Монстрів за цим запитом не знайдено.")
            );
            return;
        }

        filteredMonsters.forEach(function (monster) {
            const card = createElement("article", "item-card");

            card.appendChild(createElement("h3", "", monster.name));
            card.appendChild(createElement("p", "", "Тип: " + monster.type));
            card.appendChild(createElement("p", "", "HP: " + monster.hp));
            card.appendChild(createElement("p", "", "AC: " + monster.ac));
            card.appendChild(
                createElement("p", "", monster.description)
            );

            const addButton = createElement(
                "button",
                "",
                "Додати до Battle Tracker"
            );

            addButton.type = "button";

            addButton.addEventListener("click", function () {
                combatants.push({
                    id: Date.now().toString() +
                        Math.random().toString(36).slice(2),
                    name: monster.name,
                    initiative: 0,
                    hp: monster.hp,
                    maxHP: monster.hp
                });

                renderBattle();

                showMessage(
                    "battleMessage",
                    monster.name + " додано до трекера з ініціативою 0.",
                    "success"
                );

                openTab("battle");
            });

            card.appendChild(addButton);
            monsterList.appendChild(card);
        });
    }

    monsterSearch.addEventListener("input", function () {
        renderMonsters(monsterSearch.value);
    });

    renderMonsters();


    /* =====================================================
       5. BATTLE TRACKER
       ===================================================== */

    const battleForm = document.getElementById("battleForm");
    const battleList = document.getElementById("battleList");
    const roundNumberElement = document.getElementById("roundNumber");

    let combatants = [];
    let roundNumber = 1;

    function renderBattle() {
        battleList.replaceChildren();

        roundNumberElement.textContent = String(roundNumber);

        if (combatants.length === 0) {
            battleList.appendChild(
                createElement("p", "", "Додай першого учасника бою.")
            );
            return;
        }

        // Учасники з найбільшою ініціативою ходять першими.
        const sortedCombatants = [...combatants].sort(function (a, b) {
            return b.initiative - a.initiative;
        });

        sortedCombatants.forEach(function (combatant, index) {
            const card = createElement("article", "item-card");

            card.appendChild(
                createElement(
                    "h3",
                    "",
                    (index + 1) + ". " + combatant.name
                )
            );

            card.appendChild(
                createElement(
                    "p",
                    "",
                    "Initiative: " + combatant.initiative
                )
            );

            const hpControls = createElement("div", "hp-controls");

            hpControls.appendChild(
                createElement("span", "hp-value", "HP: " + combatant.hp)
            );

            const damageButton = createElement("button", "", "−1 HP");
            damageButton.type = "button";
            damageButton.disabled = combatant.hp <= 0;

            damageButton.addEventListener("click", function () {
                combatant.hp = Math.max(0, combatant.hp - 1);
                renderBattle();
            });

            const healButton = createElement("button", "", "+1 HP");
            healButton.type = "button";
            healButton.disabled = combatant.hp >= combatant.maxHP;

            healButton.addEventListener("click", function () {
                combatant.hp = Math.min(
                    combatant.maxHP,
                    combatant.hp + 1
                );
                renderBattle();
            });

            hpControls.appendChild(damageButton);
            hpControls.appendChild(healButton);
            card.appendChild(hpControls);

            if (combatant.hp === 0) {
                card.appendChild(
                    createElement("p", "status-message error", "HP = 0")
                );
            }

            const removeButton = createElement(
                "button",
                "secondary-button",
                "Видалити учасника"
            );

            removeButton.type = "button";

            removeButton.addEventListener("click", function () {
                combatants = combatants.filter(function (item) {
                    return item.id !== combatant.id;
                });

                renderBattle();

                showMessage(
                    "battleMessage",
                    "Учасника видалено з трекера.",
                    "success"
                );
            });

            card.appendChild(removeButton);
            battleList.appendChild(card);
        });
    }

    battleForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("combatantName").value.trim();
        const initiative = Number(
            document.getElementById("combatantInitiative").value
        );
        const hp = Number(
            document.getElementById("combatantHP").value
        );

        if (
            !name ||
            !Number.isInteger(initiative) ||
            initiative < -100 ||
            initiative > 100 ||
            !Number.isInteger(hp) ||
            hp < 0 ||
            hp > 9999
        ) {
            showMessage(
                "battleMessage",
                "Перевір ім'я, ініціативу та значення HP.",
                "error"
            );
            return;
        }

        combatants.push({
            id: Date.now().toString() +
                Math.random().toString(36).slice(2),
            name: name,
            initiative: initiative,
            hp: hp,
            maxHP: hp
        });

        renderBattle();
        battleForm.reset();

        document.getElementById("combatantInitiative").value = "10";
        document.getElementById("combatantHP").value = "10";

        showMessage(
            "battleMessage",
            "Учасника додано. Порядок ходів оновлено.",
            "success"
        );
    });

    document.getElementById("nextRoundButton").addEventListener(
        "click",
        function () {
            roundNumber += 1;
            renderBattle();

            showMessage(
                "battleMessage",
                "Розпочався раунд " + roundNumber + ".",
                "success"
            );
        }
    );

    document.getElementById("clearBattleButton").addEventListener(
        "click",
        function () {
            combatants = [];
            roundNumber = 1;
            renderBattle();

            showMessage(
                "battleMessage",
                "Трекер бою очищено.",
                "success"
            );
        }
    );

    renderBattle();


    /* =====================================================
       6. DICE CALCULATOR
       ===================================================== */

    const diceForm = document.getElementById("diceForm");
    const diceResult = document.getElementById("diceResult");

    diceForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const count = Number(document.getElementById("diceCount").value);
        const sides = Number(document.getElementById("diceSides").value);
        const modifier = Number(
            document.getElementById("diceModifier").value
        );

        const allowedSides = [4, 6, 8, 10, 12, 20, 100];

        if (
            !Number.isInteger(count) ||
            count < 1 ||
            count > 100 ||
            !allowedSides.includes(sides) ||
            !Number.isInteger(modifier) ||
            modifier < -10000 ||
            modifier > 10000
        ) {
            diceResult.replaceChildren();

            diceResult.appendChild(
                createElement(
                    "p",
                    "status-message error",
                    "Перевір кількість кубиків, тип кубика та модифікатор."
                )
            );

            return;
        }

        const rolls = [];

        for (let i = 0; i < count; i++) {
            rolls.push(Math.floor(Math.random() * sides) + 1);
        }

        const rollSum = rolls.reduce(function (sum, value) {
            return sum + value;
        }, 0);

        const total = rollSum + modifier;

        diceResult.replaceChildren();

        diceResult.appendChild(
            createElement("h3", "", "Результат кидка")
        );

        diceResult.appendChild(
            createElement(
                "p",
                "",
                count + "D" + sides +
                (modifier >= 0 ? " + " : " − ") +
                Math.abs(modifier)
            )
        );

        diceResult.appendChild(
            createElement(
                "p",
                "dice-values",
                "Результати кубиків: " + rolls.join(", ")
            )
        );

        diceResult.appendChild(
            createElement("p", "", "Сума кубиків: " + rollSum)
        );

        diceResult.appendChild(
            createElement("p", "dice-total", "Загальний результат: " + total)
        );
    });

});
