const form = document.getElementById('training-form');
const trainingsList = document.getElementById('trainings-list');
const trainingDetails = document.getElementById('training-details');
const trainingDetailsContent = document.getElementById('training-details-content');
const closeDetailsButton = document.getElementById('close-details-button');

const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');
const formTitle = document.getElementById('form-title');

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const togglePasswordButton = document.getElementById('toggle-password');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const logoutButton = document.getElementById('logout-button');
const authMessage = document.getElementById('auth-message');
const userEmail = document.getElementById('user-email');

let currentUser = null;

let editingTrainingId = null;

let trainings = [];



async function loadTrainings() {
  if (!currentUser) {
    trainings = [];
    return;
  }

  const { data, error } = await supabaseClient
    .from('trainings')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('date', { ascending: false });

  if (error) {
    console.error(error);
    alert('Не удалось загрузить тренировки.');
    trainings = [];
    return;
  }

  trainings = data || [];
}

function showAuthMessage(message) {
  authMessage.textContent = message;
}

function showAuthScreen() {
  authSection.classList.remove('hidden');
  appSection.classList.add('hidden');
  userEmail.textContent = '';
}

function showApp() {
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');

  if (currentUser) {
    userEmail.textContent = currentUser.email;
  }
}

async function checkSession() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    currentUser = null;
    showAuthScreen();
    return;
  }

  currentUser = data.user;
  showApp();
  await loadTrainings();
  renderTrainings();
}

function createTraining(data) {
  return {
    user_id: currentUser.id,
    date: data.date,
    type: data.type,
    coach: data.coach || null,
    mood: data.mood || null,
    training: data.training,
    notes: data.notes || null,
    total_volume: data.total_volume,
    dives: data.dives || null
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

function escapeHTML(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Дата не указана';
  }

  const parts = dateString.split('-');

  if (parts.length !== 3) {
    return dateString;
  }

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  return `${day}.${month}.${year}`;
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
  formTitle.textContent = 'Редактирование тренировки';
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
  formTitle.textContent = 'Новая тренировка';
  cancelEditButton.classList.add('hidden');
}

async function deleteTraining(trainingId) {
  const isConfirmed = confirm('Удалить эту тренировку?');

  if (!isConfirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from('trainings')
    .delete()
    .eq('id', trainingId)
    .eq('user_id', currentUser.id);

  if (error) {
    console.error(error);
    alert('Не удалось удалить тренировку.');
    return;
  }

  await loadTrainings();
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
    <p><strong>Дата:</strong> ${formatDate(trainingItem.date)}</p>
    <p><strong>Тип тренировки:</strong> ${getTypeLabel(trainingItem.type)}</p>
    <p><strong>Тренер:</strong> ${escapeHTML(trainingItem.coach) || 'Не указан'}</p>
    <p><strong>Самочувствие:</strong> ${getMoodLabel(trainingItem.mood)}</p>

    <hr>

    <p><strong>Тренировка:</strong></p>
    <div class="text-block">${escapeHTML(trainingItem.training) || 'Не заполнено'}</div>

    <p><strong>Ощущения / комментарии / питание:</strong></p>
    <div class="text-block">${escapeHTML(trainingItem.notes) || 'Не заполнено'}</div>

    <hr>

    <p><strong>Общий объём:</strong> ${escapeHTML(trainingItem.total_volume) || 'Не указан'}</p>
    <p><strong>Нырки:</strong> ${escapeHTML(trainingItem.dives) || 'Не указано'}</p>
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
      <h3>${formatDate(trainingItem.date)} — ${getTypeLabel(trainingItem.type)}</h3>
      <p><strong>Тренер:</strong> ${escapeHTML(trainingItem.coach) || 'Не указан'}</p>
      <p><strong>Самочувствие:</strong> ${getMoodLabel(trainingItem.mood)}</p>
      <p><strong>Общий объём:</strong> ${escapeHTML(trainingItem.total_volume) || 'Не указан'}</p>
      <p><strong>Нырки:</strong> ${escapeHTML(trainingItem.dives) || 'Не указано'}</p>

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

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!currentUser) {
    alert('Сначала войдите в аккаунт.');
    return;
  }

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

  if (!formData.date) {
    alert('Укажите дату тренировки.');
    return;
  }

  if (!formData.type) {
    alert('Выберите тип тренировки.');
    return;
  }

  if (!formData.training) {
    alert('Заполните поле "Тренировка".');
    return;
  }

  if (!formData.total_volume) {
    alert('Укажите общий объём тренировки.');
    return;
  }

  if (editingTrainingId) {
    const { error } = await supabaseClient
      .from('trainings')
      .update({
        date: formData.date,
        type: formData.type,
        coach: formData.coach || null,
        mood: formData.mood || null,
        training: formData.training,
        notes: formData.notes || null,
        total_volume: formData.total_volume,
        dives: formData.dives || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingTrainingId)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error(error);
      alert('Не удалось обновить тренировку.');
      return;
    }

    editingTrainingId = null;
    submitButton.textContent = 'Сохранить тренировку';
    formTitle.textContent = 'Новая тренировка';
    cancelEditButton.classList.add('hidden');
  } else {
    const newTraining = createTraining(formData);

    const { error } = await supabaseClient
      .from('trainings')
      .insert(newTraining);

    if (error) {
      console.error(error);
      alert('Не удалось сохранить тренировку.');
      return;
    }
  }

  await loadTrainings();
  renderTrainings();

  form.reset();
  trainingDetails.classList.add('hidden');
});

togglePasswordButton.addEventListener('click', function () {
  const isPasswordHidden = authPassword.type === 'password';

  if (isPasswordHidden) {
    authPassword.type = 'text';
    togglePasswordButton.textContent = '🙈';
    togglePasswordButton.setAttribute('aria-label', 'Скрыть пароль');
    togglePasswordButton.setAttribute('aria-pressed', 'true');
  } else {
    authPassword.type = 'password';
    togglePasswordButton.textContent = '👁';
    togglePasswordButton.setAttribute('aria-label', 'Показать пароль');
    togglePasswordButton.setAttribute('aria-pressed', 'false');
  }
});

registerButton.addEventListener('click', async function () {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (!email || !password) {
    showAuthMessage('Введите email и пароль.');
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    console.error(error);
    showAuthMessage(error.message);
    return;
  }

  if (data.user && data.session) {
    currentUser = data.user;
    showAuthMessage('');
    showApp();
    await loadTrainings();
    renderTrainings();
    return;
  }

  showAuthMessage('Регистрация создана. Теперь попробуйте войти.');
});

loginButton.addEventListener('click', async function () {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (!email || !password) {
    showAuthMessage('Введите email и пароль.');
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error(error);
    showAuthMessage(error.message);
    return;
  }

  currentUser = data.user;
  showAuthMessage('');
  showApp();
  await loadTrainings();
  renderTrainings();
});

logoutButton.addEventListener('click', async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
    alert('Не удалось выйти из аккаунта.');
    return;
  }

  currentUser = null;
  trainings = [];
  renderTrainings();
  showAuthScreen();
});

closeDetailsButton.addEventListener('click', function () {
  trainingDetails.classList.add('hidden');
});

cancelEditButton.addEventListener('click', function () {
  cancelEditTraining();
});

checkSession();
