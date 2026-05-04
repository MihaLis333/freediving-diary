const form = document.getElementById('training-form');
const trainingsList = document.getElementById('trainings-list');
const trainingDetails = document.getElementById('training-details');
const trainingDetailsContent = document.getElementById('training-details-content');
const closeDetailsButton = document.getElementById('close-details-button');

let trainings = [];

function loadTrainings() {
  const savedTrainings = localStorage.getItem('freediving_trainings');

  if (savedTrainings) {
    trainings = JSON.parse(savedTrainings);
  }
}

function saveTrainings() {
  localStorage.setItem('freediving_trainings', JSON.stringify(trainings));
}

function createTraining(data) {
  return {
    id: crypto.randomUUID(),
    user_id: null,
    date: data.date,
    type: data.type,
    coach: data.coach,
    mood: data.mood,
    training: data.training,
    notes: data.notes,
    total_volume: data.total_volume,
    dives: data.dives,
    created_at: new Date().toISOString(),
    updated_at: null
  };
}

function getTypeLabel(type) {
  if (type === 'pool') return 'Бассейн';
  if (type === 'dry') return 'Сухая';
  if (type === 'depth') return 'Глубина';

  return 'Не указан';
}

function getMoodLabel(mood) {
  if (mood === 'good') return '🙂 Хорошее';
  if (mood === 'normal') return '😐 Нормальное';
  if (mood === 'bad') return '🙁 Плохое';

  return 'Не указано';
}

function openTrainingDetails(trainingId) {
  const trainingItem = trainings.find(function(item) {
    return item.id === trainingId;
  });

  if (!trainingItem) {
    console.log('Тренировка не найдена');
    return;
  }

  trainingDetailsContent.innerHTML = `
    <p><strong>Дата:</strong> ${trainingItem.date}</p>
    <p><strong>Тип тренировки:</strong> ${getTypeLabel(trainingItem.type)}</p>
    <p><strong>Тренер:</strong> ${trainingItem.coach || 'Не указан'}</p>
    <p><strong>Самочувствие:</strong> ${getMoodLabel(trainingItem.mood)}</p>

    <hr>

    <p><strong>Тренировка:</strong></p>
    <div class="text-block">${trainingItem.training || 'Не заполнено'}</div>

    <p><strong>Ощущения / комментарии / питание:</strong></p>
    <div class="text-block">${trainingItem.notes || 'Не заполнено'}</div>

    <hr>

    <p><strong>Общий объём:</strong> ${trainingItem.total_volume || 'Не указан'}</p>
    <p><strong>Нырки:</strong> ${trainingItem.dives || 'Не указано'}</p>
  `;

  trainingDetails.classList.remove('hidden');

  trainingDetails.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function renderTrainings() {
  trainingsList.innerHTML = '';

  if (trainings.length === 0) {
    trainingsList.innerHTML = '<p class="empty-text">Пока нет записей.</p>';
    return;
  }

  trainings.forEach(function(trainingItem) {
    const item = document.createElement('div');
    item.className = 'training-item';

    item.innerHTML = `
      <h3>${trainingItem.date} — ${getTypeLabel(trainingItem.type)}</h3>
      <p><strong>Тренер:</strong> ${trainingItem.coach || 'Не указан'}</p>
      <p><strong>Самочувствие:</strong> ${getMoodLabel(trainingItem.mood)}</p>
      <p><strong>Общий объём:</strong> ${trainingItem.total_volume || 'Не указан'}</p>
      <p><strong>Нырки:</strong> ${trainingItem.dives || 'Не указано'}</p>

      <button 
        type="button" 
        class="secondary-button open-details-button"
      >
        Открыть
      </button>
    `;

    const openButton = item.querySelector('.open-details-button');

    openButton.addEventListener('click', function() {
      openTrainingDetails(trainingItem.id);
    });

    trainingsList.appendChild(item);
  });
}

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = {
    date: document.getElementById('date').value,
    type: document.getElementById('type').value,
    coach: document.getElementById('coach').value,
    mood: document.getElementById('mood').value,
    training: document.getElementById('training').value,
    notes: document.getElementById('notes').value,
    total_volume: document.getElementById('total_volume').value,
    dives: document.getElementById('dives').value
  };

  const newTraining = createTraining(formData);

  trainings.unshift(newTraining);

  saveTrainings();
  renderTrainings();

  form.reset();
});

closeDetailsButton.addEventListener('click', function() {
  trainingDetails.classList.add('hidden');
});

loadTrainings();
renderTrainings();