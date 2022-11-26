/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
; (function (window) {

    'use strict';

    // helper functions
    // from https://davidwalsh.name/vendor-prefix
    var prefix = (function () {
        var styles = window.getComputedStyle(document.documentElement, ''),
            pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
            dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];

        return {
            dom: dom,
            lowercase: pre,
            css: '-' + pre + '-',
            js: pre[0].toUpperCase() + pre.substr(1)
        };
    })();

    // vars & stuff
    var support = { transitions: Modernizr.csstransitions },
        transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
        transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
        onEndTransition = function (el, callback, propTest) {
            var onEndCallbackFn = function (ev) {
                if (support.transitions) {
                    if (ev.target != this || propTest && ev.propertyName !== propTest && ev.propertyName !== prefix.css + propTest) return;
                    this.removeEventListener(transEndEventName, onEndCallbackFn);
                }
                if (callback && typeof callback === 'function') { callback.call(this); }
            };
            if (support.transitions) {
                el.addEventListener(transEndEventName, onEndCallbackFn);
            }
            else {
                onEndCallbackFn();
            }
        },
        // the mall element
        mall = document.querySelector('.mall'),
        circles = document.getElementsByClassName('sensors'),
        hist = document.getElementsByClassName('locHistory'),
        // mall´s levels wrapper
        mallLevelsEl = mall.querySelector('.levels'),
        // mall´s levels
        mallLevels = [].slice.call(mallLevelsEl.querySelectorAll('.level')),
        // total levels
        mallLevelsTotal = mallLevels.length,
        // surroundings elems
        mallSurroundings = [].slice.call(mall.querySelectorAll('.surroundings')),
        // selected level position
        selectedLevel,
        // navigation element wrapper
        mallNav = document.querySelector('.mallnav'),
        // show all mall´s levels ctrl
        allLevelsCtrl = mallNav.querySelector('.mallnav__button--all-levels'),
        // levels navigation up/down ctrls
        levelUpCtrl = mallNav.querySelector('.mallnav__button--up'),
        levelDownCtrl = mallNav.querySelector('.mallnav__button--down'),

        areaTab = mallNav.querySelector('.tablinks__area'),
        peopleTab = mallNav.querySelector('.tablinks__people'),
        historyTab = mallNav.querySelector('.tablinks__history'),
        sensorTab = mallNav.querySelector('.tablinks__sensor'),
        fenceTab = mallNav.querySelector('.tablinks__fence'),

        // pins
        pins = [].slice.call(mallLevelsEl.querySelectorAll('.pin')),
        // content element
        contentEl = document.querySelector('.content'),
        // content close ctrl
        contentCloseCtrl = contentEl.querySelector('button.content__button'),
        // check if a content item is opened
        isOpenContentArea,
        isOpenContentArea2,
        isOpenContentArea3,
        // check if currently animating/navigating
        isNavigating,
        // check if all levels are shown or if one level is shown (expanded)
        isExpanded,
        // spaces list element
        spacesListEl = document.getElementById('spaces-list'),
        // spaces list ul
        spacesEl = spacesListEl.querySelector('ul.list'),
        // all the spaces listed
        spaces = [].slice.call(spacesEl.querySelectorAll('.list__item > a.list__link')),
        // reference to the current shows space (name set in the data-name attr of both the listed spaces and the pins on the map)
        spaceref,
        // sort by ctrls
        sortByNameCtrl = document.querySelector('#sort-by-name'),
        sortByNameCtrl2 = document.querySelector('#sort-by-name2'),
        // listjs initiliazation (all mall´s spaces)
        spacesList = new List('spaces-list', { valueNames: ['list__link', { data: ['level'] }, { data: ['category'] }] }),
        peopleList = new List('spaces-list', { valueNames: ['list__link1', { data: ['level'] }, { data: ['category'] }] }),

        /* -------------------------------------------------------------------------- */
        /*                              Start people list                             */
        /* -------------------------------------------------------------------------- */
        // spaces list element
        peopleListEl = document.getElementById('spaces-list'),
        // spaces list ul
        peopleEl = peopleListEl.querySelector('ul.peopleList'),
        // all the people listed
        peoples = [].slice.call(peopleEl.querySelectorAll('.list__item > a.list__link')),
        isShowingPeoplePin,
        // reference to the current shows space (name set in the data-name attr of both the listed people and the pins on the map)
        // listjs initiliazation (all mall´s people)
        /* -------------------------------------------------------------------------- */
        /*                             End of people list                             */
        /* -------------------------------------------------------------------------- */


        // smaller screens:
        // open search ctrl
        openSearchCtrl = document.querySelector('button.open-search'),
        // main container
        containerEl = document.querySelector('.containerMall'),
        // close search ctrl
        closeSearchCtrl = spacesListEl.querySelector('button.close-search');

    function init() {
        // init/bind events
        initEvents();
    }

    /**
     * Initialize/Bind events fn.
     */
    function initEvents() {
        hideTemp();
        // click on a Mall´s level
        mallLevels.forEach(function (level, pos) {
            level.addEventListener('click', function () {
                // shows this level
                showLevel(pos + 1);
            });
        });

        // click on the show mall´s levels ctrl
        allLevelsCtrl.addEventListener('click', function () {
            // shows all levels
            showAllLevels();
        });

        // navigating through the levels
        levelUpCtrl.addEventListener('click', function () { navigate('Down'); });
        levelDownCtrl.addEventListener('click', function () { navigate('Up'); });

        // navigating through the tabs
        areaTab.addEventListener('click', function () { OpenTab('area'); })
        peopleTab.addEventListener('click', function () { OpenTab('people', selectedLevel); })
        historyTab.addEventListener('click', function () { OpenTab('history'); })
        sensorTab.addEventListener('click', function () { OpenTab('sensor'); })
        fenceTab.addEventListener('click', function () { OpenTab('fence'); })

        // sort by name ctrl - add/remove category name (css pseudo element) from list and sorts the spaces by name 
        sortByNameCtrl.addEventListener('click', function () {
            if (this.checked) {
                classie.remove(spacesEl, 'grouped-by-category');
                spacesList.sort('list__link');
            }
            else {
                classie.add(spacesEl, 'grouped-by-category');
                spacesList.sort('category');
            }
        });
        sortByNameCtrl2.addEventListener('click', function () {
            if (this.checked) {
                classie.remove(peopleEl, 'grouped-by-category');
                spacesList.sort('list__link');
            }
            else {
                classie.add(peopleEl, 'grouped-by-category');
                spacesList.sort('category');
            }
        });

        // hovering a pin / clicking a pin
        pins.forEach(function (pin) {
            var contentItem = contentEl.querySelector('.content__item[data-space="' + pin.getAttribute('data-space') + '"]');

            // pin.addEventListener('mouseenter', function () {
            //     if (!isOpenContentArea) {
            //         classie.add(contentItem, 'content__item--hover');
            //     }
            // });
            // pin.addEventListener('mouseleave', function () {
            //     if (!isOpenContentArea) {
            //         classie.remove(contentItem, 'content__item--hover');
            //     }
            // });
            pin.addEventListener('click', function (ev) {
                ev.preventDefault();
                // open content for this pin
                openContent(pin.getAttribute('data-space'));
                // remove hover class (showing the title)
                classie.remove(contentItem, 'content__item--hover');
            });
        });

        // closing the content area
        contentCloseCtrl.addEventListener('click', function () {
            closeContentArea();
        });

        // clicking on a listed space: open level - shows space
        spaces.forEach(function (space) {
            var spaceItem = space.parentNode,
                level = spaceItem.getAttribute('data-level'),
                spacerefval = spaceItem.getAttribute('data-space');

            space.addEventListener('click', function (ev) {
                ev.preventDefault();
                // for smaller screens: close search bar
                closeSearch();
                // open level
                showLevel(level);
                // open content for this space
                openContent(spacerefval);
            });
        });

        /* -------------------------------------------------------------------------- */
        /*                 what happens to people listed when clicked                 */
        /* -------------------------------------------------------------------------- */
        peoples.forEach(function (person) {
            var personItem = person.parentNode,
                level = personItem.getAttribute('data-level'),
                spacerefval = personItem.getAttribute('data-space');

            person.addEventListener('click', function (ev) {
                ev.preventDefault();
                // for smaller screens: close search bar
                closeSearch();
                // open level
                showLevel(level);
                // open content for this space
                openContent2(spacerefval);
            });
        });


        /* -------------------------------------------------------------------------- */
        /*                             End people list                                */
        /* -------------------------------------------------------------------------- */

        // smaller screens: open the search bar
        openSearchCtrl.addEventListener('click', function () {
            openSearch();
        });

        // smaller screens: close the search bar
        closeSearchCtrl.addEventListener('click', function () {
            closeSearch();
        });
    }

    function testFunc(spacerefval) {
        var blinkEl = mallLevelsEl.querySelector('.pin[data-space="' + spacerefval + '"]');
        const blinkClass = blinkEl.classList;
        // if (blinkClass.contains('pin--blink')) {
        // 	blinkClass.toggle('pin--blink');
        // }
        var activeItem = peopleEl.querySelector('li.list__item--active');
        if (activeItem) {
            classie.remove(activeItem, 'list__item--active');
        }
        // list item gets class active (if the list item is currently shown in the list)
        var listItem = peopleEl.querySelector('li[data-space="' + spacerefval + '"]');
        if (listItem) {
            classie.add(listItem, 'list__item--active');
        }
        // blinkClass.toggle('pin--blink');
        blinkClass.add('pin--blink');


    }

    function showPeoplePin(spacerefval) {
        classie.add(mallLevelsEl.querySelector('.pin[data-space="' + spacerefval + '"]'), 'pin--blink');
    }

    function hidePeoplePin(spacerefval) {
        classie.remove(mallLevelsEl.querySelector('.pin[data-space="' + spacerefval + '"]'), 'pin--active');
    }

    /**
     * Opens a level. The current level moves to the center while the other ones move away.
     */
    function showLevel(level) {
        if (isExpanded) {
            return false;
        }

        // update selected level val
        selectedLevel = level;
        document.getElementById('defaultOpen').className += " active boxbutton--dark";
        // control navigation controls state
        setNavigationState();

        classie.add(mallLevelsEl, 'levels--selected-' + selectedLevel);

        // the level element
        var levelEl = mallLevels[selectedLevel - 1];
        classie.add(levelEl, 'level--current');

        onEndTransition(levelEl, function () {
            classie.add(mallLevelsEl, 'levels--open');

            // show level pins
            showAreaPins();

            isExpanded = true;
        }, 'transform');

        // hide surroundings element
        hideSurroundings();

        // show mall nav ctrls
        showMallNav();

        // filter the spaces for this level
        showLevelSpaces();
    }

    /**
     * Shows all Mall´s levels
     */
    function showAllLevels() {
        if (isNavigating || !isExpanded) {
            return false;
        }
        isExpanded = false;
        document.getElementById('spaces-list').style.visibility = 'visible';
        OpenTab("area");
        classie.remove(mallLevels[selectedLevel - 1], 'level--current');
        classie.remove(mallLevelsEl, 'levels--selected-' + selectedLevel);
        classie.remove(mallLevelsEl, 'levels--open');
        // hide level pins
        removeAreaPins();
        hideCircles();
        removeSensor();
        hideTemp();
        hideHistory();
        removeFence();
        // shows surrounding element
        showSurroundings();
        // hide mall nav ctrls
        hideMallNav();
        removePeoplePins()
        // show back the complete list of spaces
        spacesList.filter();

        // close content area if it is open
        if (isOpenContentArea) {
            closeContentArea();
        }
    }

    /**
     * Shows all spaces for current level
     */
    function showLevelSpaces() {
        spacesList.filter(function (item) {
            return item.values().level === selectedLevel.toString();
        });
    }

    /**
     * Shows the level´s pins
     */
    function showAreaPins(levelEl) {
        var levelEl = levelEl || mallLevels[selectedLevel - 1];
        classie.add(levelEl.querySelector('.level__AreaPins'), 'level__AreaPins--active');
    }

    function showPeoplePins(levelEl) {
        var levelEl = levelEl || mallLevels[selectedLevel - 1];
        classie.add(levelEl.querySelector('.level__PeoplePins'), 'level__PeoplePins--active');
    }
    function showSensor(levelEl) {
        var levelEl = levelEl || mallLevels[selectedLevel - 1];
        classie.add(levelEl.querySelector('.level__sensor'), 'level__sensor--active');
    }
    function showFence(levelEl) {
        var levelEl = levelEl || mallLevels[selectedLevel - 1];
        classie.add(levelEl.querySelector('.level__fence'), 'level__fence--active');
    }

    /**
     * Removes the level´s pins
     */
    function removeAreaPins(levelEl) {
        var levelEl = levelEl || mallLevels[selectedLevel - 1];
        classie.remove(levelEl.querySelector('.level__AreaPins'), 'level__AreaPins--active');
    }

    /**
     * Removes the level´s peolpe pins
     */
    function removePeoplePins(levelEl) {
        var levelEl = levelEl || mallLevels[selectedLevel - 1];
        classie.remove(levelEl.querySelector('.level__PeoplePins'), 'level__PeoplePins--active');
    }

    /**
     * Removes the level´s sensors 
     */
    function removeSensor(levelEl) {
        var levelEl = levelEl || mallLevels[selectedLevel - 1];
        classie.remove(levelEl.querySelector('.level__sensor'), 'level__sensor--active');
    }
    /**
     * Removes the level´s fences 
     */
    function removeFence(levelEl) {
        var levelEl = levelEl || mallLevels[selectedLevel - 1];
        classie.remove(levelEl.querySelector('.level__fence'), 'level__fence--active');
    }

    /**
     * Show the navigation ctrls
     */
    function showMallNav() {
        classie.remove(mallNav, 'mallnav--hidden');
    }

    /**
     * Hide the navigation ctrls
     */
    function hideMallNav() {
        classie.add(mallNav, 'mallnav--hidden');
    }

    /**
     * Show the surroundings level
     */
    function showSurroundings() {
        mallSurroundings.forEach(function (el) {
            classie.remove(el, 'surroundings--hidden');
        });
    }

    /**
     * Hide the surroundings level
     */
    function hideSurroundings() {
        mallSurroundings.forEach(function (el) {
            classie.add(el, 'surroundings--hidden');
        });
    }

    /**
     * Navigate through the mall´s levels
     */
    function navigate(direction) {
        if (isNavigating || !isExpanded || isOpenContentArea) {
            return false;
        }
        isNavigating = true;

        var prevSelectedLevel = selectedLevel;

        // current level
        var currentLevel = mallLevels[prevSelectedLevel - 1];

        if (direction === 'Up' && prevSelectedLevel > 1) {
            --selectedLevel;
        }
        else if (direction === 'Down' && prevSelectedLevel < mallLevelsTotal) {
            ++selectedLevel;
        }
        else {
            isNavigating = false;
            return false;
        }

        // control navigation controls state (enabled/disabled)
        setNavigationState();
        // transition direction class
        classie.add(currentLevel, 'level--moveOut' + direction);
        // next level element
        var nextLevel = mallLevels[selectedLevel - 1]
        // ..becomes the current one
        classie.add(nextLevel, 'level--current');

        // when the transition ends..
        onEndTransition(currentLevel, function () {
            classie.remove(currentLevel, 'level--moveOut' + direction);
            // solves rendering bug for the SVG opacity-fill property
            setTimeout(function () { classie.remove(currentLevel, 'level--current'); }, 60);

            classie.remove(mallLevelsEl, 'levels--selected-' + prevSelectedLevel);
            classie.add(mallLevelsEl, 'levels--selected-' + selectedLevel);

            // show the current level´s pins
            showAreaPins();

            isNavigating = false;
        });

        // filter the spaces for this level
        showLevelSpaces();

        // hide the previous level´s pins
        removeAreaPins(currentLevel);
        OpenTab('area', currentLevel);
    }

    /**
     * Navigate through tabs
     */
    function OpenTab(tabName, level) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active boxbutton--dark", "");
        }
        document.getElementById(tabName).style.display = "block";
        if (tabName === 'area') {
            removePeoplePins(level);
            removeSensor(level);
            removeFence(level);
            hideCircles();
            hideHistory();
            showAreaPins();
            document.getElementById('defaultOpen').className += " active boxbutton--dark";
            document.getElementsByClassName('mallnav')[0].style.left = '18rem';
            document.getElementById('spaces-list').style.visibility = 'visible';
            hideTemp();
        }
        else if (tabName === 'fence') {
            removePeoplePins();
            removeAreaPins();
            removeSensor();
            hideCircles();
            hideTemp();
            hideHistory();
            showFence();
            if (isOpenContentArea) {
                closeContentArea()
            }
            document.getElementById('fenceLink').className += " active boxbutton--dark";
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            document.getElementById('spaces-list').style.visibility = 'hidden';
            document.getElementsByClassName('mallnav')[0].style.left = '0';
        }
        else if (tabName === 'people') {
            showPeoplePins();
            removeAreaPins();
            removeSensor();
            hideHistory();
            hideCircles();
            removeFence();
            if (isOpenContentArea) {
                closeContentArea()
            }
            document.getElementById('peopleLink').className += " active boxbutton--dark";
            document.getElementsByClassName('mallnav')[0].style.left = '18rem';
            document.getElementById('spaces-list').style.visibility = 'visible';
            hideTemp();
            var people = document.getElementById(tabName),
                peopleList = people.querySelector('.peopleList'),
                lists = peopleList.querySelectorAll('.list__item');
            for (var i = 0; i < lists.length; i++) {
                if (lists[i].getAttribute("data-level") === level.toString()) {
                    lists[i].style.display = "block";
                }
                else {
                    lists[i].style.display = "none";
                }
            }
        }
        else if (tabName === 'history') {
            removeAreaPins();
            removePeoplePins(level);
            showPeoplePins();
            showHistory();
            removeSensor();
            hideCircles();
            hideTemp();
            removeFence();
            if (isOpenContentArea) {
                closeContentArea()
            }
            document.getElementById('historyLink').className += " active boxbutton--dark";
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            document.getElementById('spaces-list').style.visibility = 'hidden';
            document.getElementsByClassName('mallnav')[0].style.left = '0';
        }
        else if (tabName === 'sensor') {
            removeAreaPins();
            removePeoplePins(level);
            hideHistory();
            removeFence();
            showSensor(level);
            showCircles();
            showTemp();
            if (isOpenContentArea) {
                closeContentArea()
            }
            document.getElementById('sensorLink').className += " active boxbutton--dark";
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            document.getElementById('spaces-list').style.visibility = 'hidden';
            document.getElementsByClassName('mallnav')[0].style.left = '0';
        }
    }

    /**
     * Control navigation ctrls state. Add disable class to the respective ctrl when the current level is either the first or the last.
     */
    function setNavigationState() {
        if (selectedLevel == 1) {
            classie.add(levelDownCtrl, 'boxbutton--disabled');
        }
        else {
            classie.remove(levelDownCtrl, 'boxbutton--disabled');
        }

        if (selectedLevel == mallLevelsTotal) {
            classie.add(levelUpCtrl, 'boxbutton--disabled');
        }
        else {
            classie.remove(levelUpCtrl, 'boxbutton--disabled');
        }
    }

    /**
     * Opens/Reveals a content item.
     */
    function openContent(spacerefval) {
        // if one already shown:
        if (isOpenContentArea) {
            hideSpace();
            spaceref = spacerefval;
            showSpace();
        }
        else {
            spaceref = spacerefval;
            openContentArea();
        }

        // remove class active (if any) from current list item
        var activeItem = spacesEl.querySelector('li.list__item--active');
        if (activeItem) {
            classie.remove(activeItem, 'list__item--active');
        }
        // list item gets class active (if the list item is currently shown in the list)
        var listItem = spacesEl.querySelector('li[data-space="' + spacerefval + '"]')
        if (listItem) {
            classie.add(listItem, 'list__item--active');
        }

        // remove class selected (if any) from current space
        var activeSpaceArea = mallLevels[selectedLevel - 1].querySelector('svg > .map__space--selected');
        if (activeSpaceArea) {
            classie.remove(activeSpaceArea, 'map__space--selected');
        }
        // svg area gets selected
        classie.add(mallLevels[selectedLevel - 1].querySelector('svg > .map__space[data-space="' + spaceref + '"]'), 'map__space--selected');
    }
    function openContent2(spacerefval) {
        // if one already shown:
        if (isOpenContentArea2) {
            hideSpace2();
            spaceref = spacerefval;
            showSpace2();
        }
        else {
            spaceref = spacerefval;
            openContentArea2();
        }

        // remove class active (if any) from current list item
        var activeItem = peopleEl.querySelector('li.list__item--active');
        if (activeItem) {
            classie.remove(activeItem, 'list__item--active');
        }
        // list item gets class active (if the list item is currently shown in the list)
        var listItem = peopleEl.querySelector('li[data-space="' + spacerefval + '"]')
        if (listItem) {
            classie.add(listItem, 'list__item--active');
        }

        // remove class selected (if any) from current space
        var activeSpaceArea = mallLevels[selectedLevel - 1].querySelector('svg > .map__space--selected');
        if (activeSpaceArea) {
            classie.remove(activeSpaceArea, 'map__space--selected');
        }
        // svg area gets selected
        // classie.add(mallLevels[selectedLevel - 1].querySelector('svg > .map__space[data-space="' + spaceref + '"]'), 'map__space--selected');
    }
    /**
     * Opens the content area.
     */
    function openContentArea() {
        isOpenContentArea = true;
        // shows space
        showSpace(true);
        // show close ctrl
        classie.remove(contentCloseCtrl, 'content__button--hidden');
        // resize mall area
        classie.add(mall, 'mall--content-open');
        // disable mall nav ctrls
        classie.add(levelDownCtrl, 'boxbutton--disabled');
        classie.add(levelUpCtrl, 'boxbutton--disabled');
    }
    function openContentArea2() {
        isOpenContentArea2 = true;
        showSpace2(true);
        // classie.add(levelDownCtrl, 'boxbutton--disabled');
        // classie.add(levelUpCtrl, 'boxbutton--disabled');
    }
    /**
     * Shows a space.
     */
    function showSpace(sliding) {
        // the content item
        var contentItem = contentEl.querySelector('.content__item[data-space="' + spaceref + '"]');
        // show content
        classie.add(contentItem, 'content__item--current');
        if (sliding) {
            onEndTransition(contentItem, function () {
                classie.add(contentEl, 'content--open');
            });
        }
        // map pin gets selected
        classie.add(mallLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'), 'pin--active');
    }

    function showSpace2(sliding) {
        classie.add(mallLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'), 'pin--blink');
        // if (sliding) {
        //     onEndTransition(contentItem, function () {
        //         classie.add(contentEl, 'content--open');
        //     });
        // }
    }
    /**
     * Closes the content area.
     */
    function closeContentArea() {
        classie.remove(contentEl, 'content--open');
        // close current space
        hideSpace();
        // hide close ctrl
        classie.add(contentCloseCtrl, 'content__button--hidden');
        // resize mall area
        classie.remove(mall, 'mall--content-open');
        // enable mall nav ctrls
        if (isExpanded) {
            setNavigationState();
        }
        isOpenContentArea = false;
    }

    /**
     * Hides a space.
     */
    function hideSpace() {
        // the content item
        var contentItem = contentEl.querySelector('.content__item[data-space="' + spaceref + '"]');
        // hide content
        // classie.remove(contentItem, 'content__item--current');
        contentItem.classList.remove('content__item--current');
        // map pin gets unselected
        classie.remove(mallLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'), 'pin--active');
        // remove class active (if any) from current list item
        var activeItem = spacesEl.querySelector('li.list__item--active');
        if (activeItem) {
            classie.remove(activeItem, 'list__item--active');
        }
        // remove class selected (if any) from current space
        var activeSpaceArea = mallLevels[selectedLevel - 1].querySelector('svg > .map__space--selected');
        if (activeSpaceArea) {
            classie.remove(activeSpaceArea, 'map__space--selected');
        }
    }
    function hideSpace2() {
        // the content item
        // var contentItem = contentEl.querySelector('.content__item[data-space="' + spaceref + '"]');
        // hide content
        // classie.remove(contentItem, 'content__item--current');
        // map pin gets unselected
        classie.remove(mallLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'), 'pin--blink');
        // remove class active (if any) from current list item
        var activeItem = spacesEl.querySelector('li.list__item--active');
        if (activeItem) {
            classie.remove(activeItem, 'list__item--active');
        }
        // remove class selected (if any) from current space
        // var activeSpaceArea = mallLevels[selectedLevel - 1].querySelector('svg > .map__space--selected');
        // if (activeSpaceArea) {
        //     classie.remove(activeSpaceArea, 'map__space--selected');
        // }
    }

    function hideCircles() {
        for (var i = 0; i < circles.length; i++) {
            circles[i].style.display = "none";
        }
    }

    function showCircles() {
        for (var i = 0; i < circles.length; i++) {
            circles[i].style.display = "block";
        }
    }

    function hideHistory() {
        for (var i = 0; i < hist.length; i++) {
            hist[i].style.display = "none";
        }
    }
    function showHistory() {
        for (var i = 0; i < hist.length; i++) {
            hist[i].style.display = "block";
        }
    }

    /**
     * Show temperature values above the ac icon
     */
    function showTemp() {
        document.documentElement.style.setProperty('--state', 'visible')
    }

    /**
     * hide temperature values above the ac icon
     */
    function hideTemp() {
        document.documentElement.style.setProperty('--state', 'hidden')
    }

    /**
     * for smaller screens: open search bar
     */
    function openSearch() {
        // shows all levels - we want to show all the spaces for smaller screens 
        showAllLevels();

        classie.add(spacesListEl, 'spaces-list--open');
        classie.add(containerEl, 'containerMall--overflow');
    }

    /**
     * for smaller screens: close search bar
     */
    function closeSearch() {
        classie.remove(spacesListEl, 'spaces-list--open');
        classie.remove(containerEl, 'containerMall--overflow');
    }

    init();

})(window);