const boxContainer = document.getElementById('boxContainer');
const addBoxButton = document.getElementById('addBox');
const removeBoxButton = document.getElementById('removeBox');
const colgroupDisplay = document.getElementById('colgroupDisplay');
const copyButton = document.getElementById('copyButton');

let numBoxes = 1;
const minBoxes = 1;
const minWidthPercentage = 1; // Minimum width percentage

function createBox() {
    const box = document.createElement('div');
    box.classList.add('box');
    box.style.flex = `1 1 ${100 / numBoxes}%`;

    const divider = document.createElement('div');
    divider.classList.add('divider');

    divider.addEventListener('mousedown', startResizing);

    box.appendChild(divider);
    boxContainer.appendChild(box);
    updateBoxWidths();
}

function updateBoxWidths() {
    const boxes = document.querySelectorAll('.box');
    const totalBoxes = boxes.length;
    const widthPercentage = Math.floor(100 / totalBoxes);

    boxes.forEach((box, index) => {
        const boxWidthPercentage = (index === totalBoxes - 1)
            ? 100 - widthPercentage * (totalBoxes - 1)
            : widthPercentage;
        box.style.flex = `1 1 ${boxWidthPercentage}%`;
        const widthDisplay = box.querySelector('.width-display');
        if (widthDisplay) {
            widthDisplay.textContent = `${boxWidthPercentage}%`;
        } else {
            const widthDisplayElement = document.createElement('div');
            widthDisplayElement.classList.add('width-display');
            widthDisplayElement.textContent = `${boxWidthPercentage}%`;
            box.appendChild(widthDisplayElement);
        }
    });

    updateColgroupDisplay();
}

function updateColgroupDisplay() {
    const boxes = document.querySelectorAll('.box');
    let colgroupHTML = '<colgroup>\n';
    boxes.forEach((box) => {
        const boxWidth = box.style.flex.split(' ')[2];
        colgroupHTML += `  <col width="${boxWidth}" />\n`;
    });
    colgroupHTML += '</colgroup>';
    colgroupDisplay.textContent = colgroupHTML;
}

function copyToClipboard() {
    const range = document.createRange();
    range.selectNode(colgroupDisplay);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
        document.execCommand('copy');
        alert('클립보드에 복사되었습니다!');
    } catch (err) {
        alert('Failed to copy');
    }
    window.getSelection().removeAllRanges();
}

addBoxButton.addEventListener('click', () => {
    numBoxes += 1;
    createBox();
});

removeBoxButton.addEventListener('click', () => {
    if (numBoxes > minBoxes) {
        boxContainer.removeChild(boxContainer.lastElementChild);
        numBoxes -= 1;
        updateBoxWidths();
    }
});

copyButton.addEventListener('click', copyToClipboard);

function startResizing(e) {
    e.preventDefault();
    const startX = e.clientX;
    const box = e.target.parentElement;
    const nextBox = box.nextElementSibling;

    const boxInitialWidth = box.offsetWidth;
    const nextBoxInitialWidth = nextBox ? nextBox.offsetWidth : 0;

    function resizeHandler(e) {
        const dx = e.clientX - startX;
        const totalWidth = boxContainer.offsetWidth;
        let newBoxWidth = boxInitialWidth + dx;
        let newNextBoxWidth = nextBoxInitialWidth - dx;

        // Ensure minimum width is 1%
        if (newBoxWidth / totalWidth * 100 < minWidthPercentage) {
            newBoxWidth = minWidthPercentage / 100 * totalWidth;
            newNextBoxWidth = boxInitialWidth + nextBoxInitialWidth - newBoxWidth;
        } else if (newNextBoxWidth / totalWidth * 100 < minWidthPercentage) {
            newNextBoxWidth = minWidthPercentage / 100 * totalWidth;
            newBoxWidth = boxInitialWidth + nextBoxInitialWidth - newNextBoxWidth;
        }

        const newBoxWidthPercentage = Math.floor((newBoxWidth / totalWidth) * 100);
        const newNextBoxWidthPercentage = Math.floor((newNextBoxWidth / totalWidth) * 100);

        box.style.flex = `1 1 ${newBoxWidthPercentage}%`;
        if (nextBox) {
            nextBox.style.flex = `1 1 ${newNextBoxWidthPercentage}%`;
        }

        const boxWidthDisplay = box.querySelector('.width-display');
        if (boxWidthDisplay) {
            boxWidthDisplay.textContent = `${newBoxWidthPercentage}%`;
        }

        const nextBoxWidthDisplay = nextBox ? nextBox.querySelector('.width-display') : null;
        if (nextBoxWidthDisplay) {
            nextBoxWidthDisplay.textContent = `${newNextBoxWidthPercentage}%`;
        }

        updateColgroupDisplay();
    }

    function stopResizing() {
        window.removeEventListener('mousemove', resizeHandler);
        window.removeEventListener('mouseup', stopResizing);
    }

    window.addEventListener('mousemove', resizeHandler);
    window.addEventListener('mouseup', stopResizing);
}

createBox();
