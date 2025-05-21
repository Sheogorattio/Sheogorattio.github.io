const API_BASE = 'http://localhost:8080';

const countrySelect = document.getElementById('country');
const citySelect = document.getElementById('city');
const usernameInput = document.getElementById('username');

let isUsernameUnique = false;

// Перевірка унікальності при втраті фокусу
usernameInput.addEventListener('blur', async () => {
  const nickname = usernameInput.value.trim();
  if (!nickname) return;

  try {
    const res = await axios.get(`${API_BASE}/auth/isunique/${nickname}`);
    if (res.data === true) {
      isUsernameUnique = true;
      usernameInput.setCustomValidity('');
    } else {
      isUsernameUnique = false;
      usernameInput.setCustomValidity('Ім’я користувача вже зайняте');
    }
  } catch (err) {
    console.error('Помилка перевірки унікальності імені', err);
    isUsernameUnique = false;
    usernameInput.setCustomValidity('Не вдалося перевірити унікальність імені');
  }
  usernameInput.reportValidity();
});

// Завантажити країни
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await axios.get(`${API_BASE}/regions/countries`);
    res.data.forEach(country => {
      const option = document.createElement('option');
      option.value = country.id;
      option.textContent = country.name;
      countrySelect.appendChild(option);
    });

    // ⬇️ якщо є хоча б одна країна — одразу завантажити міста для неї
    if (res.data.length > 0) {
      const firstCountryId = res.data[0].id;
      countrySelect.value = firstCountryId;
      loadCitiesForCountry(firstCountryId);
    }
  } catch (err) {
    console.error('Не вдалося завантажити країни', err);
  }
});

// 🔁 функція для повторного використання
async function loadCitiesForCountry(countryId) {
  citySelect.innerHTML = ''; // очистити попередні міста

  try {
    const res = await axios.get(`${API_BASE}/regions/parent/${countryId}`);
    if (!res.data.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Міст не знайдено';
      citySelect.appendChild(option);
      return;
    }

    res.data.forEach(city => {
      const option = document.createElement('option');
      option.value = city.id;
      option.textContent = city.name;
      citySelect.appendChild(option);
    });
  } catch (err) {
    console.error('Не вдалося завантажити міста', err);
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Помилка завантаження';
    citySelect.appendChild(option);
  }
}

// Обробник вибору країни (на випадок, якщо їх буде більше)
countrySelect.addEventListener('change', (e) => {
  const countryId = e.target.value;
  loadCitiesForCountry(countryId);
});


// Надсилання форми
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nickname = usernameInput.value.trim();

  // Перевіряємо унікальність прямо перед відправкою
  try {
    const res = await axios.get(`${API_BASE}/auth/isunique/${nickname}`);
    if (res.data !== true) {
      alert('Ім’я користувача вже зайняте');
      return;
    }
  } catch (err) {
    alert('Не вдалося перевірити унікальність імені');
    return;
  }

  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;
  const birthDate = document.getElementById('birthDate').value;
  const regionId = document.getElementById('city').value;

  const data = {
    id: null,
    username: nickname,
    password,
    avatarId: null,
    role: "USER",
    accSubscribers: 0,
    accFollowings: 0,
    userData: {
      id: null,
      birthDate,
      isArtist: true,
      regionId,
      email
    }
  };

  try {
    const response = await axios.post(`${API_BASE}/auth/sign-up`, data, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
    alert('Реєстрація успішна!');
    console.log(response.data);
  } catch (error) {
    console.error(error);
    alert('Помилка реєстрації');
  }
});
