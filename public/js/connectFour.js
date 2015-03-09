(function ($) {

    var connectFour = {
        tableSize: [7, 6],
        currentPlayer: 'yellow',
        positions: [],
        yellowScore: 0,
        redScore: 0,
        $body: $('body'),
        isReset: false,

        init: function () {

            // Generate Game board & setup piece click handler
            this.buildGameBoard();

            // Is there scores set in local storage? otherwise lets start clean
            this.setupPlayerDetails();

            // Setup click handlers
            this.setupMenuOptions();
            this.setupDialogClickHandler();

            // Lets add the fancy current player indicator
            this.setupCurrentPieceIndicator();

        },
        buildGameBoard: function () {
            // Loops through Y
            _(this.tableSize[1]).times(function (row) {
                // build positions array rows
                this.positions[row] = [];
                // Loops through X
                _(this.tableSize[0]).times(function (col) {
                    // Append circle game pieces to #main and initiate the click handlers
                    $('#main').append(this.createConnectCircle(col, row));
                    // Build Positions array columns
                    this.positions[row][col] = 0;
                }.bind(this));
            }.bind(this));
        },
        createConnectCircle: function (col, row) {
            // return a new jquery element w/ origin data attributes and click handler
            return $('<div>')
                .addClass('item')
                .attr('data-col', col)
                .attr('data-row', row)
                .bind('click', this.clickHandler);
        },
        clickHandler: function (event) {
            event.preventDefault();

            // parseInt [data-col] string
            var col = parseInt($(this).attr('data-col'));

            for (var row = connectFour.tableSize[1] - 1; row >= 0; row--) {

                // Query for piece slot
                var $slot = $('[data-col="' + col + '"][data-row="' + row + '"]');

                // Is there a playable position in the column
                if (connectFour.positions[0][col] !== 0) {
                    connectFour.showDialog('Invalid move, please try again');
                    break;
                }

                if (connectFour.positions[row][col] == 0) {

                    $slot.addClass(connectFour.currentPlayer);

                    connectFour.positions[row][col] = connectFour.currentPlayer;

                    connectFour.checkHorizontal(row);
                    connectFour.checkVertical(col);
                    connectFour.checkDiagonal();

                    if(!connectFour.isReset) {
                        connectFour.currentPlayer = connectFour.currentPlayer == 'yellow' ? 'red' : 'yellow';
                    }
                    else {
                        connectFour.isReset = false;
                    }

                    connectFour.checkPieceIndicator();

                    if (row == 0) {
                        connectFour.checkTie();
                    }

                    break;
                }
            }
        },
        setupMenuOptions: function () {
            // Setup reset game board
            $('.reset-board').on('click', function (e) {
                e.preventDefault();
                connectFour.resetBoard();
            });

            // Setup reset game score
            $('.reset-game').on('click', function (e) {
                e.preventDefault();
                connectFour.resetGame();
            });

        },
        setupDialogClickHandler: function () {

            $('.close-dialog').on('click', function (e) {
                e.preventDefault();

                connectFour.$body.removeClass('dialog-open');

            });

        },
        setupPlayerDetails: function () {

            // Check local storage for saved value, otherwise 0
            this.yellowScore = parseInt(localStorage['yellowScore']) || 0;
            this.redScore = parseInt(localStorage['redScore']) || 0;

            // Set the value we get to the dom element
            $('[data-score="yellow"]')[0].innerHTML = this.yellowScore;
            $('[data-score="red"]')[0].innerHTML = this.redScore;

        },
        setupCurrentPieceIndicator: function() {

        },
        checkPieceIndicator: function() {
            var $pieceIndicator = $('.piece-indicator');

            if(this.currentPlayer == 'yellow') {
                $pieceIndicator .addClass('yellow');
                $pieceIndicator .removeClass('red');
            }
            else
            {
                $pieceIndicator .addClass('red');
                $pieceIndicator .removeClass('yellow');
            }

        },
        checkHorizontal: function (row) {

            var count = {
                'red': '',
                'yellow': '',
                0: ''
            };

            for (var col = 0; col < this.tableSize[0]; col++) {

                count[this.positions[row][col]] += col + ',';

            }

            this.checkObjectForWinner(count);

        },
        checkVertical: function (col) {

            var count = {
                'red': '',
                'yellow': '',
                0: ''
            };

            for (var row = 0; row < this.tableSize[1]; row++) {

                count[this.positions[row][col]] += row + ',';

            }

            this.checkObjectForWinner(count);

        },
        checkDiagonal: function () {
            var bounds = 8,
                topLeft = {
                    'red': '',
                    'yellow': '',
                    0: ''
                },
                topRight = {
                    'red': '',
                    'yellow': '',
                    0: ''
                };

            for (var x = 0; x < this.tableSize[0]; x++) {

                for (var y = 0; y < this.tableSize[1]; y++) {

                    // Check top left diagonal
                    for (var i = 0; i < bounds; i++) {

                        // Bounds check
                        if (this.positions[x + i] == undefined || this.positions[x + i][y + i] == undefined) {
                            break;
                        }

                        topLeft[this.positions[x + i][y + i]] += ( x + i ) + ',';

                    }

                    this.checkObjectForWinner(topLeft);

                    topLeft = {
                        'red': '',
                        'yellow': '',
                        0: ''
                    };

                    for (var j = 0; j < bounds; j++) {

                        // Bounds check
                        if (this.positions[x - j] == undefined || this.positions[x - j][y + j] == undefined) {
                            break;
                        }

                        topRight[this.positions[x + -j][y + j]] += ( x + -j ) + ',';

                    }

                    this.checkObjectForWinner(topRight);

                    topRight = {
                        'red': '',
                        'yellow': '',
                        0: ''
                    };

                }

            }

        },
        checkObjectForWinner: function (obj) {

            _.each(obj, function (str, i) {

                // Lets get an array to count
                var pieces = str.split(','),
                    winnerCount = 0;

                // Drop the last element, its the trailing ',' from the string concat
                pieces.pop();

                // If we have four values, and that value is either yellow or red lets run the winning logic check
                if (pieces.length >= 4 && (i == 'yellow' || i == 'red')) {


                    for (var k = 0; k <= pieces.length; k++) {

                        // Have we already won?
                        if (winnerCount >= 4) {
                            break;
                        }

                        // Have we reached the end of the array?
                        if (pieces[k + 1] == undefined) {
                            // Lets check the last element to the one from before
                            if (pieces[k - 1] !== undefined && Math.abs(pieces[k - 1] - pieces[k]) == 1) {
                                // Looks good, lets give them a winnerCount increment
                                winnerCount++;
                            }
                            // We have reached the end of the array, lets get out of here
                            break;
                        }

                        // Is the value of the two cells greater than 1? ( This would mean we are not in sequential order )
                        if (Math.abs(pieces[k] - pieces[k + 1]) !== 1) {

                            // Reset winner Count and continue checking for a possible win senario
                            winnerCount = 0;
                            continue;
                        }
                        else {
                            // It matched!
                            winnerCount++;
                        }

                    }

                    // Hooray, Someone has won!
                    if (winnerCount >= 4) {
                        this.showWinner();
                    }
                }

            }.bind(this));

        },
        showWinner: function () {

            this.isReset = true;

            // Increment the score to account for the new win!
            this.incrementPlayerScore(this.currentPlayer);

            // Show a dialog to let the player know they have won! Congrats!
            this.showDialog(this.currentPlayer + ' won!');

            // Lets reset the board for a new game!
            this.resetBoard();
        },
        incrementPlayerScore: function (player) {

            // Lets increment, save the value to local storage and updating the dom for the desired player
            if (player == 'yellow') {
                this.yellowScore++;
                localStorage.setItem('yellowScore', this.yellowScore);
                $('[data-score="yellow"]')[0].innerHTML = this.yellowScore;
            }
            else {
                this.redScore++;
                localStorage.setItem('redScore', this.redScore);
                $('[data-score="red"]')[0].innerHTML = this.redScore;
            }

        },
        checkTie: function () {

            var isTie = true;

            _(this.positions).every(function (i) {
                // Check for playable piece slots in the rows
                if (i.indexOf(0) > -1) {
                    // Found a playable piece, lets get out of here!
                    isTie = false;
                    return false;
                }
            });

            if (isTie) {
                // The game was a tie, no more moves are available, lets let the players know
                this.showDialog('Tie Game');

                // Lets also reset the game board for them
                this.resetBoard();
            }

        },
        showDialog: function (content) {

            // Grab the dialog dom
            var $dialog = $('.dialog');

            // Set the dialog content to whatever message we want
            $('.dialog-content')[0].innerHTML = content;

            // Lets make sure the dialog is centered in the page
            $dialog.css({
                'width': $dialog.outerWidth(),
                'margin-top': -$dialog.outerHeight() / 2,
                'margin-left': -$dialog.outerWidth() / 2
            });

            this.$body.addClass('dialog-open');

        },
        resetBoard: function () {

            $('#main')[0].innerHTML = '';

            this.buildGameBoard();
            this.setupPlayerDetails();
        },

        resetGame: function () {

            // Lets reset the game back to the default by setting player scored to 0
            this.yellowScore = 0;
            this.redScore = 0;

            // Reset local storage variables
            localStorage.setItem('yellowScore', 0);
            localStorage.setItem('redScore', 0);

            // We can't forget to update the dom for the user
            $('[data-score="yellow"]').innerHTML = 0;
            $('[data-score="red"]').innerHTML = 0;

            this.resetBoard();

        }
    };

    // Lets kick off our script to create our board and start the game!
    connectFour.init();

})(jQuery);