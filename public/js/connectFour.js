(function ($) {

    var connectFour = {
        tableSize: [7, 6],
        currentPlayer: 'yellow',
        positions: [],
        yellowScore: 0,
        redScore: 0,
        $body: $('body'),

        init: function () {

            // Generate Game board & setup piece click handler
            this.buildGameBoard();

            // Is there scores set in local storage? otherwise lets start clean
            this.setupPlayerDetails();

            // Setup click handlers
            this.setupMenuOptions();
            this.setupDialogClickHandler();

        },
        buildGameBoard: function () {
            _(this.tableSize[1]).times(function (row) {
                this.positions[row] = [];
                _(this.tableSize[0]).times(function (col) {
                    $('#main').append(this.createConnectCircle(col, row));
                    this.positions[row][col] = 0;
                }.bind(this));
            }.bind(this));
        },
        createConnectCircle: function (col, row) {
            return $('<div>')
                .addClass('item')
                .attr('data-col', col)
                .attr('data-row', row)
                .bind('click', this.clickHandler);
        },
        clickHandler: function (event) {
            event.preventDefault();

            var col = parseInt($(this).attr('data-col'));

            for (var row = connectFour.tableSize[1] - 1; row >= 0; row--) {

                var $slot = $('[data-col="' + col + '"][data-row="' + row + '"]');

                if (connectFour.positions[0][col] !== 0) {
                    console.log('invalid move');
                    break;
                }
                if (connectFour.positions[row][col] == 0) {

                    $slot.addClass(connectFour.currentPlayer);

                    connectFour.positions[row][col] = connectFour.currentPlayer;

                    connectFour.checkHorizontal(row);
                    connectFour.checkVertical(col);
                    connectFour.checkDiagonal();

                    connectFour.currentPlayer = connectFour.currentPlayer == 'yellow' ? 'red' : 'yellow';

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

                if (pieces.length >= 4 && (i == 'yellow' || i == 'red')) {

                    for (var k = 0; k <= pieces.length; k++) {

                        if (winnerCount >= 4) {
                            break;
                        }

                        if (pieces[k + 1] == undefined) {
                            if (pieces[k - 1] !== undefined && Math.abs(pieces[k - 1] - pieces[k]) == 1) {
                                winnerCount++;
                            }
                            break;
                        }

                        if (Math.abs(pieces[k] - pieces[k + 1]) !== 1) {

                            winnerCount = 0;
                            continue;
                        }
                        else {
                            winnerCount++;
                        }

                    }

                    if (winnerCount >= 4) {
                        this.showWinner();
                    }
                }

            }.bind(this));

        },
        checkTie: function () {

            var isTie = true;

            _(this.positions).every(function (i) {
                if (i.indexOf(0) > -1) {
                    isTie = false;
                    return false;
                }
            });

            if (isTie) {
                this.showDialog('Tie Game');
                this.resetBoard();
            }

        },
        showWinner: function () {

            this.incrementPlayerScore(this.currentPlayer);

            this.showDialog(this.currentPlayer + ' Won');

            this.resetBoard();
        },
        setupPlayerDetails: function () {
            this.yellowScore = parseInt(localStorage['yellowScore']) || 0;

            $('[data-score="yellow"]')[0].innerHTML = this.yellowScore;

            this.redScore = parseInt(localStorage['redScore']) || 0;

            $('[data-score="red"]')[0].innerHTML = this.redScore;

        },
        showDialog: function (content) {

            var $dialog = $('.dialog');

            $('.dialog-content')[0].innerHTML = content;

            $dialog.css({
                'width': $dialog.outerWidth(),
                'margin-top': -$dialog.outerHeight() / 2,
                'margin-left': -$dialog.outerWidth() / 2
            });

            this.$body.addClass('dialog-open');

        },
        incrementPlayerScore: function (player) {

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
        resetBoard: function () {

            $('#main')[0].innerHTML = '';

            // @TODO Investigate after win first game chip is set to red
            // Ensure player is set to yellow next game
            this.currentPlayer = 'yellow';

            this.buildGameBoard();
            this.setupPlayerDetails();
        },

        resetGame: function () {

            this.yellowScore = 0;
            this.redScore = 0;

            localStorage.setItem('yellowScore', 0);
            localStorage.setItem('redScore', 0);

            $('[data-score="yellow"]').innerHTML = 0;
            $('[data-score="red"]').innerHTML = 0;

            this.resetBoard();

        }
    };

    connectFour.init();

})(jQuery);