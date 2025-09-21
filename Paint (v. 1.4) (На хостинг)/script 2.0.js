const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let historyStack = [];
let currentStep = -1;

let x = 0;
let y = 0;

canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 30;

    canvas.addEventListener('mousemove', function(event) {
        // Получаем координаты мыши относительно канваса
        const rect = canvas.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;

        // Обновляем отображение координат
        //console.log(`Координаты мыши: (x: ${x}, y: ${y})`);
    });

// Сохраняем начальное состояние canvas
saveState();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth - 30;
    canvas.height = window.innerHeight - 30;

    // Перерисовываем последнее состояние после изменения размера
    if (currentStep >= 0) {
        ctx.putImageData(historyStack[currentStep], 0, 0);
    }
});

let isDrawing = false;
let currentColor = '#000000';
let currentBrushSize = 5;
let currentOpacity = 1; // Добавляем переменную для непрозрачности

// Настройки по умолчанию
ctx.strokeStyle = currentColor;
ctx.lineWidth = currentBrushSize;
ctx.lineCap = 'round';
ctx.globalAlpha = currentOpacity; // Устанавливаем начальную непрозрачность

// Обработчики инструментов
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));

        if(btn.classList.contains('eraser')) {
            // Режим ластика
            ctx.globalCompositeOperation = 'destination-out';
            currentBrushSize = parseFloat(document.getElementById('brushSize').value);
            ctx.lineWidth = currentBrushSize * 2;
        } else {
            // Режим рисования
            ctx.globalCompositeOperation = 'source-over';
            currentColor = btn.dataset.color;
            ctx.strokeStyle = currentColor;
            currentBrushSize = parseFloat(document.getElementById('brushSize').value);
            ctx.lineWidth = currentBrushSize;
        }
        btn.classList.add('active');

        saveState();
    });
});

// Сохранение статистики рисования
function saveState() {
    currentStep++;
    if (currentStep < historyStack.length) {
        historyStack.length = currentStep;
    }
    historyStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

// Шаг назад
const undoButton = document.getElementById('undobutton');
undoButton.addEventListener('click', undo);

function undo() {
    if(currentStep > 0) {
        currentStep--;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(historyStack[currentStep], 0, 0);
    } else {
        console.log("Нечего отменять");
    }
}

// Удалить всё
const clear = document.getElementById('clearAll').addEventListener('click', clearCanvas);

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyStack = [];
    currentStep = -1;
    saveState();
}

// Размер кисти
const brushSizeSlider = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');

brushSizeSlider.addEventListener('input', () => {
    currentBrushSize = brushSizeSlider.value;
    brushSizeValue.textContent = currentBrushSize; 

    if (ctx.globalCompositeOperation === 'destination-out') {
        ctx.lineWidth = currentBrushSize * 2;
    } else {
        ctx.lineWidth = currentBrushSize; // Убедитесь, что это также обновляется
    }
});

// Непрозрачность
const opacityInput = document.getElementById("opacity");
const opacityDisplay = document.getElementById("opacityDisplay");

opacityInput.addEventListener("input", function () {
    currentOpacity = parseFloat(this.value);
    opacityDisplay.textContent = `${Math.round(currentOpacity * 100)}`;
    ctx.globalAlpha = currentOpacity; // Устанавливаем непрозрачность для рисования
});

// Рисование круга
    document.addEventListener('keydown', function(event) {
        if (event.key === '1') {
            ctx.beginPath();
            ctx.arc(x, y, currentBrushSize, 0, Math.PI * 2, true); // Круг радиусом 50
            ctx.fillStyle = currentColor; // Цвет заливки
            ctx.fill(); // Заполняем круг
        }
    });

// Рисование квадрата
    document.addEventListener('keydown', function(event) {
        if (event.key === '2') {
            ctx.beginPath();
            ctx.fillStyle = currentColor;
            ctx.fillRect(x, y, currentBrushSize, currentBrushSize); // Рисуем квадрат
            console.log(`Нарисован квадрат`)
        }
    });

// Обработчики рисования
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function draw(e) {
    if(!isDrawing) return;
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    saveState(); // Сохраняем состояние после каждого штриха
}

function stopDrawing() {
    isDrawing = false;
}
