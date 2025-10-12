$(document).ready(function() {
    console.log("document successfully loaded");
    // load game state and update UI
    const gs = loadGameState();
    updateUI(gs);
    $('#main-menu').removeClass('active');
    $('#sec-menu').hide();
    $('#gamble-menu').hide();
    $('#bar').css('width', gs.barWidth + '%');
    if (gs.upgrades.crackFortune === false) {
        $('#bar').hide();
    }
    else {
        $('#bar').show();
    }

    // event listener for the cookie button
    $('#fortune-button').on('click', () => {
        console.log('Fortune clicked');
        //bounce when clicked
        $('#fortune-button').animate({
            marginTop: "+=5px"
        }, 50, () => {
            $('#fortune-button').animate({
                marginTop: "-=5px"
            }, 50);
        });
        //main click addition
        if (gs != null && gs.upgrades != null) {
            if (gs.doubleClick === true) {
                gs.totalFortunes += gs.upgrades.fortunePerClick * 2;
            }
            else {
                gs.totalFortunes += gs.upgrades.fortunePerClick;
            }
        }
        else {
            console.error('Game state or upgrades not initialized properly.');
        }
        //for progress bar
        if (gs.upgrades.crackFortune === true) {
            //gets the value of width
            let width = parseInt(gs.barWidth);
            //if not full then fill bar
            if (width < 100) {
                let newWidth = width + 1;
                gs.barWidth = parseInt(gs.barWidth) + 1;
                $('#bar').css('width', newWidth + '%');
            }
            //if full then check if we already activated doubleClick
            else if (gs.barWidth >= 100) {
                if (gs.doubleClick != true) {
                    gs.doubleClick = true;
                    $('#bar').text('Double Fortunes');
                    $('#fortune-img').attr('src', 'images/crackedFortune.png');
                    $('#fortune-button').css('width', '50rem');
                    
                    //for 30 seconds doubleClick is true
                    setTimeout(() => {
                        gs.doubleClick = false;
                        gs.barWidth = 0;
                        $('#bar').text('');
                        $('#fortune-img').attr('src', 'images/fortuneCookie.png');
                        $('#fortune-button').css('width', '25rem');
                        console.log('Double fortune bonus ended.');
                    }, 30000);
                    console.log(gs.barWidth);
                }
            }
        }
        saveGameState(gs);
        updateUI(gs);
    });

    // EL for menu icon
    $('#main-menu-icon').on('click', () => {
        $('#main-menu').toggleClass('active');
        console.log("btn clicked");
    });
    //EL for menu back btn
    $('#main-menu-back').on('click', () => {
        $('#main-menu').toggleClass('active');
    });

    //EL for upgrade purchase
    $('#upg-btn-1').on('click', () => {
        //Use the current price as the cost
        const cost = gs.upgrades.fortunePerClickPrice;
        if (gs.totalFortunes < cost) {
            console.log('Not enough fortunes to purchase upgrade');
            return;
        }
        // Deduct cost first
        gs.totalFortunes = gs.totalFortunes - cost;
        // Increase per-click and then raise the price for next level
        gs.upgrades.fortunePerClick += 1;
        // New price is previous price multiplied (round to integer)
        gs.upgrades.fortunePerClickPrice = Math.floor(cost + 50);
        saveGameState(gs);
        updateUI(gs);
    });
    $('#upg-btn-2').on('click', () => {
        //Use the current price as the cost
        const cost = Number(gs.upgrades.fortunePerSecPrice);
        if (gs.totalFortunes < cost) {
            console.log('Not enough fortunes to purchase upgrade');
            return;
        }
        // Deduct cost first
        gs.totalFortunes -= cost;
        // Increase per-click and then raise the price for next level
        gs.upgrades.fortunePerSec += 1;
        // New price is previous price multiplied (round to integer)
        gs.upgrades.fortunePerSecPrice = Math.floor(cost * 1.5);
        saveGameState(gs);
        updateUI(gs);
    });
    $('#upg-btn-3').on('click', () => {
        //Use the current price as the cost
        const cost = Number(gs.upgrades.crackFortunePrice);
        if (gs.upgrades.crackFortune === false) {
            if (gs.totalFortunes < cost) {
                console.log('Not enough fortunes to purchase upgrade');
                return;
            }
            // Deduct cost first
            gs.totalFortunes -= cost;
            //owned upgrades are true
            gs.upgrades.crackFortune = true;
            $('#bar').show();
        }
        saveGameState(gs);
        updateUI(gs);
    });

    // Second Menu EL
    $('#sec-menu-btn').on('click', () => {
        $('#sec-menu').toggle();
    });
    $('#sec-menu-back').on('click', () => {
        $('#sec-menu').toggle();
    });
    //Reset button EL
    $('#reset-btn').on('click', () => {
        localStorage.removeItem('gameState');
        location.reload(); // reload page to reinit state
    });
    //cheat EL
    $('#cheat-btn').on('click', () => {
        gs.totalFortunes += 100000000;
        saveGameState(gs);
        updateUI(gs);
    });
    //Invite EL
    $('#gamble-btn').on('click', () => {
        $('#gamble-menu').toggle();
    });
    $('#gamble-back').on('click', () => {
        $('#gamble-menu').toggle();
    });
    $('form').submit(function(event) {
        event.preventDefault();
        if (gs.totalFortunes > 10000) {
            let form = $('form').serializeArray();
            if (form[0].value === 'yes') {
                let rand = Math.random();
                gs.totalFortunes -= 10000;

                if (rand <= .50) {
                    gs.upgrades.fortunePerClick += 10;
                    console.log('+10 FPC');
                }
                else if (rand <= .85) {
                    gs.totalFortunes =Math.floor(gs.totalFortunes / 2);
                    console.log('you lost 1/2 fortunes');
                }
                else {
                    gs.totalFortunes *= 2;
                    console.log('x2 fortunes');
                }
            }
            console.log('form submitted');
        }
        $('#gamble-menu').toggle();
    });

    //Time loop for upgrade 2
    setInterval(function() {
        if (gs) {
            gs.totalFortunes += gs.upgrades.fortunePerSec * gs.upgrades.fortunePerClick;
            saveGameState(gs);
            updateUI(gs);
        }
    }, 1000);
});

// Load game state from local storage or initialize if not present
function loadGameState() {
    // Check if gameState exists in local storage
    if (localStorage.getItem('gameState') == null) {
        // Initialize default game state
        const defaultState = {
            totalFortunes: 0,
            doubleClick: false,
            barWidth: 0.0,
            upgrades: {
                fortunePerClick: 1,
                fortunePerClickPrice: 50,
                fortunePerSec: 0,
                fortunePerSecPrice: 100,
                crackFortune: false,
                crackFortunePrice: 10000,
            }
        };
        // JSON method turns the object back into a string for local storage
        localStorage.setItem('gameState', JSON.stringify(defaultState));
    }
    
    // Load game state from local storage
    const local = localStorage.getItem('gameState');
    if (local) {
        // turns the local string into object so I can use its attributes
        const gs = JSON.parse(local);
        console.log('Loaded game state:', gs);
        return gs;
    }
}

function saveGameState(gs) {
    localStorage.setItem('gameState', JSON.stringify(gs));
    console.log('Game state saved:', gs);
}

function updateUI(gs) {
    //fortune count
    $('#fortune-count').text(gs.totalFortunes);
    //upgrade UI
    $('#upgrade-1 .upgCount').text(gs.upgrades.fortunePerClick);
    $('#upgrade-1 .upgPrice').text(gs.upgrades.fortunePerClickPrice);
    
    $('#upgrade-2 .upgCount').text(gs.upgrades.fortunePerSec);
    $('#upgrade-2 .upgPrice').text(gs.upgrades.fortunePerSecPrice);

    if (gs.upgrades.crackFortune === true) {
        $('#upgrade-3 .upgCount').text("1/1");
        $('#upgrade-3 .upgPrice').text("Sold Out");
    }
    else {
        $('#upgrade-3 .upgCount').text("0/1");
        $('#upgrade-3 .upgPrice').text(gs.upgrades.crackFortunePrice);
    }
}
