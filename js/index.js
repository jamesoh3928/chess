//=====================================
//	CONFIGURABLES
//=====================================

const COL_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const TILES = {};

let SelectedPiece = null;

// Logic board
const GAME_BOARD = [];
for (let row = 0; row < 8; row++) {
	GAME_BOARD[row] = [];
	
	for (let col = 0; col < 8; col++) {
		GAME_BOARD[row][col] = {
			piece: null,
			validPieces: []
		};
	}
}

//=====================================
//	CORE
//=====================================

function refreshBoardUI(board) {
	$("#board").children(".piece").remove();
	
	for (const pieceObj of board.activePieces) {
		const position = TILES[COL_LETTERS[pieceObj.position.col] + (pieceObj.position.row + 1)].position();
		const piece = $('<div></div>').appendTo($("#board"));
		piece.addClass("piece " + pieceObj.type + " " + (pieceObj.isBlack ? "black" : "white"));
		piece.css("top", (parseInt(position.top) + 40) + "px");
		piece.css("left", (parseInt(position.left) + 40) + "px");
		piece.click(function() {
			if (board.isBlackTurn === pieceObj.isBlack) {
				$("#board").children(".tile.indicator").remove();
				
				if (piece === SelectedPiece?.object) {
					piece.removeClass("selected");
					SelectedPiece = null;
					return;
				}
				
				$("#board").children(".piece.selected").removeClass("selected");
				piece.addClass("selected");
				SelectedPiece = {object: piece, position: COL_LETTERS[pieceObj.position.col] + (pieceObj.position.row + 1)};
				
				for (const move of pieceObj.moves) {
					const position = TILES[COL_LETTERS[move.col] + (move.row + 1)].position();
					const indicator = $('<div class="tile indicator" />').appendTo("#board");
					indicator.css("top", position.top);
					indicator.css("left", position.left);
					indicator.click(function() {
						if (SelectedPiece === null) {
							return;
						}

						const position = TILES[COL_LETTERS[move.col] + (move.row + 1)].position();
						board.movePiece(SelectedPiece.position, COL_LETTERS[move.col] + (move.row + 1));
						piece.css("top", (parseInt(position.top) + 40) + "px");
						piece.css("left", (parseInt(position.left) + 40) + "px");

						$("#board").children(".tile.indicator").remove();
						SelectedPiece = null;
					});
				}
			}
		});
	}
}

// Initialization function
function onInit() {
	const board = new Board();
	board.onTurnChange = function(isBlackTurn) {
		// console.log(isBlackTurn ? "Black's Turn" : "White's Turn");
		// console.log(board.capturedPieces);
		refreshBoardUI(board);
		
		$("#board").children(".piece.disabled").removeClass("disabled");
		
		if (isBlackTurn) {
			$("#board").children(".piece.white").addClass("disabled");
		} else {
			$("#board").children(".piece.black").addClass("disabled");
		}
	};
	
	for (let i = 1; i <= 8; i++) {
		const remainder = i % 2;
		
		for (let j = 1; j <= 8; j++) {
			const tile = $('<div></div>').appendTo($("#board"));
			tile.addClass("tile");
			
			if (j % 2 == remainder) {
				tile.addClass("black");
			} else {
				tile.addClass("white");
			}
			
			tile.css("bottom", (12.5 * (i - 1)) + "%");
			tile.css("left", (12.5 * (j - 1)) + "%");
			tile.attr("data-tile-id", COL_LETTERS[j - 1] + i);
			
			TILES[COL_LETTERS[j - 1] + i] = tile;
		}
		
	}

	board.start();
	
}

//=====================================
//	EVENTS
//=====================================

$(document).ready(function() {
	onInit();
});
