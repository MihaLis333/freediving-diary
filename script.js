const form = document.getElementById('training-form');
const trainingsList = document.getElementById('trainings-list');
const trainingDetails = document.getElementById('training-details');
const trainingDetailsContent = document.getElementById('training-details-content');
const closeDetailsButton = document.getElementById('close-details-button');

const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');

let editingTrainingId = null;

let trainings = [];

function formatDateRu(dateString) {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-');

  return `${day}.${month}.${year}`;
}

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

function startEditTraining(trainingId) {
  const trainingItem = trainings.find(function (item) {
    return item.id === trainingId;
  });

  if (!trainingItem) {
    return;
  }

  editingTrainingId = trainingItem.id;

  document.getElementById('date').value = trainingItem.date;
  document.getElementById('type').value = trainingItem.type;
  document.getElementById('coach').value = trainingItem.coach;
  document.getElementById('mood').value = trainingItem.mood;
  document.getElementById('training').value = trainingItem.training;
  document.getElementById('notes').value = trainingItem.notes;
  document.getElementById('total_volume').value = trainingItem.total_volume;
  document.getElementById('dives').value = trainingItem.dives;

  submitButton.textContent = 'Сохранить изменения';
  cancelEditButton.classList.remove('hidden');

  trainingDetails.classList.add('hidden');

  form.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

function cancelEditTraining() {
  editingTrainingId = null;

  form.reset();

  submitButton.textContent = 'Сохранить тренировку';
  cancelEditButton.classList.add('hidden');
}

function deleteTraining(trainingId) {
  const isConfirmed = confirm('Удалить эту тренировку?');

  if (!isConfirmed) {
    return;
  }

  trainings = trainings.filter(function (item) {
    return item.id !== trainingId;
  });

  saveTrainings();
  renderTrainings();

  trainingDetails.classList.add('hidden');
}

function openTrainingDetails(trainingId) {
  const trainingItem = trainings.find(function (item) {
    return item.id === trainingId;
  });

  if (!trainingItem) {
    console.log('Тренировка не найдена');
    return;
  }

  trainingDetailsContent.innerHTML = `
    <p><strong>Дата:</strong> ${formatDateRu(trainingItem.date)}</p>
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

function sortTrainingsByDate() {
  trainings.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });
}

function renderTrainings() {
  sortTrainingsByDate();

  trainingsList.innerHTML = '';

  if (trainings.length === 0) {
    trainingsList.innerHTML = '<p class="empty-text">Пока нет записей.</p>';
    return;
  }

  trainings.forEach(function (trainingItem) {
    const item = document.createElement('div');
    item.className = 'training-item';

    item.innerHTML = `
      <h3>${formatDateRu(trainingItem.date)} — ${getTypeLabel(trainingItem.type)}</h3>
      <p><strong>Тренер:</strong> ${trainingItem.coach || 'Не указан'}</p>
      <p><strong>Самочувствие:</strong> ${getMoodLabel(trainingItem.mood)}</p>
      <p><strong>Общий объём:</strong> ${trainingItem.total_volume || 'Не указан'}</p>
      <p><strong>Нырки:</strong> ${trainingItem.dives || 'Не указано'}</p>

      <div class="training-actions">
        <button
          type="button"
          class="secondary-button open-details-button"
        >
          Открыть
        </button>

        <button
          type="button"
          class="secondary-button edit-training-button"
        >
          Редактировать
        </button>

        <button
          type="button"
          class="danger-button delete-training-button"
        >
          Удалить
        </button>
      </div>
    `;

    const openButton = item.querySelector('.open-details-button');

    openButton.addEventListener('click', function () {
      openTrainingDetails(trainingItem.id);
    });

    const deleteButton = item.querySelector('.delete-training-button');

    const editButton = item.querySelector('.edit-training-button');

    editButton.addEventListener('click', function () {
      startEditTraining(trainingItem.id);
    });

    deleteButton.addEventListener('click', function () {
      deleteTraining(trainingItem.id);
    });

    trainingsList.appendChild(item);
  });
}

form.addEventListener('submit', function (event) {
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

  if (editingTrainingId) {
    trainings = trainings.map(function (item) {
      if (item.id === editingTrainingId) {
        return {
          ...item,
          date: formData.date,
          type: formData.type,
          coach: formData.coach,
          mood: formData.mood,
          training: formData.training,
          notes: formData.notes,
          total_volume: formData.total_volume,
          dives: formData.dives,
          updated_at: new Date().toISOString()
        };
      }

      return item;
    });

    editingTrainingId = null;
    submitButton.textContent = 'Сохранить тренировку';
    cancelEditButton.classList.add('hidden');
  } else {
    const newTraining = createTraining(formData);
    trainings.unshift(newTraining);
  }

  saveTrainings();
  renderTrainings();

  form.reset();
  trainingDetails.classList.add('hidden');
});

closeDetailsButton.addEventListener('click', function () {
  trainingDetails.classList.add('hidden');
});

cancelEditButton.addEventListener('click', function () {
  cancelEditTraining();
});

loadTrainings();
renderTrainings();
