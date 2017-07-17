export const COLOURS = ['red', 'green', 'blue', 'yellow'];

export function randomColour(x, y) {
  return COLOURS[Math.floor(Math.random() * COLOURS.length)];
}

export class ColouredGrid {
  constructor(columnCount = 10, rowCount = 10, colourGenerator = randomColour) {
    this._rowCount = rowCount;
    this._columnCount = columnCount;
    this._grid = [];

    for (let x = 0; x < columnCount; x++) {
      let col = [];
      for (let y = 0; y < rowCount; y++) {
        col.push(colourGenerator(x, y));
      }

      this._grid.push(col);
    }
  }

  columns() {
    return this._grid;
  }

  removeConnectedBlocksOfSameColourStartingAt(x, y) {
    const colourToRemove = this._grid[x][y];
    const blocksToRemove = new Set();

    this._selectBlocksToRemove(x, y, colourToRemove, blocksToRemove);
    this._markBlocksToRemove(blocksToRemove);
    this._removeMarkedBlocks();
  }

  _selectBlocksToRemove(x, y, colourToRemove, blocksToRemove) {
    if (this._grid[x][y] != colourToRemove) {
      return;
    }
    if (blocksToRemove.has(`${x},${y}`)) {
      return;
    }

    blocksToRemove.add(`${x},${y}`);

    if (x - 1 >= 0) {
      this._selectBlocksToRemove(x - 1, y, colourToRemove, blocksToRemove);
    }
    if (x + 1 < this._columnCount) {
      this._selectBlocksToRemove(x + 1, y, colourToRemove, blocksToRemove);
    }
    if (y - 1 >= 0) {
      this._selectBlocksToRemove(x, y - 1, colourToRemove, blocksToRemove);
    }
    if (y + 1 < this._rowCount) {
      this._selectBlocksToRemove(x, y + 1, colourToRemove, blocksToRemove);
    }
  }

  _markBlocksToRemove(blocksToRemove) {
    [...blocksToRemove.values()].forEach(coordinates => {
      const [x, y] = coordinates.split(',').map(i => parseInt(i, 10));
      delete this._grid[x][y];
    });
  }

  _removeMarkedBlocks() {
    for (const column in this._grid) {
      this._grid[column] = this._grid[column].filter(Boolean);
    }
  }
}

export class ColouredGridDOMRenderer {
  constructor(grid, el = document.querySelector('#gridEl')) {
    this._grid = grid;
    this._el = el;
    this._rowCount = grid.columns()[0].length;

    this._render();
  }

  _render() {
    this._el.innerHTML = '';

    const columns = this._grid.columns();
    columns.forEach((column, x) => {
      const colEl = document.createElement('div');
      colEl.classList.add('col');

      column.forEach((colour, y) => {
        const blockEl = document.createElement('div');
        blockEl.classList.add('block');
        blockEl.style.backgroundColor = colour;
        blockEl.style.height = `calc(100% / ${this._rowCount}`;

        blockEl.addEventListener('click', _ => this._blockClicked(x, y));
        colEl.appendChild(blockEl);
      });

      this._el.appendChild(colEl);
    });
  }

  _blockClicked(x, y) {
    this._grid.removeConnectedBlocksOfSameColourStartingAt(x, y);

    // Re-rendering the whole grid is fast enough for a 10x10 grid on an iPhone 6.
    // And simple.
    //
    // If we see cases of poor performance, we can change the algorithm to delete
    // blocks that have been removed.
    this._render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ColouredGridDOMRenderer(new ColouredGrid());
});
