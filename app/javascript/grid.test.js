import {
  randomColour,
  ColouredGrid,
  ColouredGridDOMRenderer,
  COLOURS
} from './grid';
import { assert } from 'chai';

describe('randomColour', function() {
  it('returns a randomColour for every coordinate', function() {
    let testCoords = [[1, 2], [4, 9], [0, 0]];

    testCoords.forEach(([x, y]) => {
      assert.include(COLOURS, randomColour(x, y));
    });
  });
});

describe('ColouredGrid', function() {
  it('creates a grid of colours', function() {
    const grid = new ColouredGrid();
    for (const column of grid.columns()) {
      for (const colour of column) {
        assert.include(COLOURS, colour);
      }
    }
  });

  it('creates a red grid', function() {
    function red(x, y) {
      return COLOURS[0];
    }

    const grid = new ColouredGrid(10, 10, red);
    for (const column of grid.columns()) {
      for (const colour of column) {
        assert.equal(colour, COLOURS[0]);
      }
    }
  });

  describe('#removeConnectedBlocksOfSameColourStartingAt', function() {
    const testcases = [
      {
        before: [
          // prettier-ignore
          ['green', 'green', 'green'],
          ['red', 'green', 'green'],
          ['green', 'green', 'green']
        ],
        after: [
          // prettier-ignore
          ['green', 'green', 'green'],
          ['green', 'green'],
          ['green', 'green', 'green']
        ],
        startAt: { x: 1, y: 0 }
      },
      {
        before: [
          // prettier-ignore
          ['green', 'green', 'green'],
          ['red', 'red', 'red'],
          ['green', 'green', 'green']
        ],
        after: [
          // prettier-ignore
          ['green', 'green', 'green'],
          [],
          ['green', 'green', 'green']
        ],
        startAt: { x: 1, y: 1 }
      },
      {
        before: [
          // prettier-ignore
          ['green', 'red', 'green', 'green'],
          ['red', 'red', 'red', 'red'],
          ['green', 'red', 'green', 'green']
        ],
        after: [
          // prettier-ignore
          ['green', 'green','green'],
          [],
          ['green', 'green', 'green']
        ],
        startAt: { x: 1, y: 1 }
      },
      {
        before: [
          // prettier-ignore
          ['red', 'red', 'green', 'red'],
          ['red', 'red', 'green', 'green'],
          ['green', 'red', 'red', 'red']
        ],
        after: [
          // prettier-ignore
          ['green', 'red'],
          ['green', 'green'],
          ['green']
        ],
        startAt: { x: 1, y: 1 }
      }
    ];

    function makeColourGenerator(before) {
      return function(x, y) {
        return before[x][y];
      };
    }

    testcases.forEach(({
      before,
      after,
      startAt
    }, index) => {
      it(`case ${index}`, function() {
        const grid = new ColouredGrid(
          before.length,
          before[0].length,
          makeColourGenerator(before)
        );

        const blocksToRemove = grid.removeConnectedBlocksOfSameColourStartingAt(
          startAt.x,
          startAt.y
        );
        assert.deepEqual(grid.columns(), after);
      });
    });
  });
});

describe('ColouredGridDOMRenderer', function() {
  let el;
  let grid;
  const colouredGrid = [
    ['red', 'green', 'blue'],
    ['green', 'blue', 'red'],
    ['blue', 'red', 'green']
  ];

  before(function() {
    grid = {
      columns() {
        return colouredGrid;
      }
    };
    el = document.createElement('div');
    new ColouredGridDOMRenderer(grid, el);
  });

  it('assigns background colours', function() {
    const backgroundColors = [...el.childNodes].map(column => {
      return [...column.childNodes].map(block => block.style.backgroundColor);
    });

    assert.deepEqual(colouredGrid, backgroundColors);
  });

  it('calls removeConnectedBlocksOfSameColourStartingAt when clicking blocks', function() {
    let xCalled;
    let yCalled;
    grid.removeConnectedBlocksOfSameColourStartingAt = function(x, y) {
      xCalled = x;
      yCalled = y;
    };

    el.firstChild.firstChild.click();

    assert.strictEqual(xCalled, 0);
    assert.strictEqual(yCalled, 0);

    el.lastChild.lastChild.click();
    assert.strictEqual(xCalled, 2);
    assert.strictEqual(yCalled, 2);
  });
});
