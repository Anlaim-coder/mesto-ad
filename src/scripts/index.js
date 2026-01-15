import { enableValidation, clearValidation } from "./components/validations.js";
import { createCardElement} from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { getUserInfo, getCardList, setUserInfo, updateAvatar, addCard, deleteCardFromServer, toggleLike } from "./components/api.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

let userId = ""; // Единая переменная для ID пользователя

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// Функция улучшения UX (индикатор загрузки)
const renderLoading = (isLoading, button) => {
  button.textContent = isLoading ? "Сохранение..." : "Сохранить";
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Удаление карточки
const handleDeleteCard = (cardElement, cardId) => {
  deleteCardFromServer(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch(err => console.log(err));
};

// Обработчик лайка
const handleLike = (likeButton, cardId, likeCountElement) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  toggleLike(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch(err => console.log(err));
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton);

  setUserInfo(profileTitleInput.value, profileDescriptionInput.value)
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(err => console.log(err))
    .finally(() => renderLoading(false, submitButton));
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton);

  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch(err => console.log(err))
    .finally(() => renderLoading(false, submitButton));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton);
  submitButton.textContent = "Создание...";

  addCard(cardNameInput.value, cardLinkInput.value)
    .then((cardData) => {
      const newCard = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLike,
          onDeleteCard: handleDeleteCard,
        },
        userId
      );
      placesWrap.prepend(newCard);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch(err => console.log(err))
    .finally(() => renderLoading(false, submitButton));
};

// Слушатели
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => setCloseModalWindowEventListeners(popup));

enableValidation(validationSettings);

// Загрузка данных
Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    userId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLike,
            onDeleteCard: handleDeleteCard,
          },
          userId
        )
      );
    });
  })
  .catch(err => console.log(err));
  // 1. Находим новые DOM-узлы для статистики
const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(".popup__list");
const logo = document.querySelector(".logo");

// Шаблоны для статистики
const infoDefinitionTemplate = document.getElementById("popup-info-definition-template");
const userPreviewTemplate = document.getElementById("popup-info-user-preview-template");

// 2. Функция форматирования даты
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Вспомогательная функция для создания строки статистики (dt/dd)
const createInfoString = (label, value) => {
  const element = infoDefinitionTemplate.content.cloneNode(true);
  element.querySelector(".popup__info-term").textContent = label;
  element.querySelector(".popup__info-description").textContent = value;
  return element;
};

// 3. Основной обработчик клика по логотипу
const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      // Очищаем списки перед наполнением
      usersStatsModalInfoList.innerHTML = "";
      usersStatsModalUsersList.innerHTML = "";

      if (cards.length > 0) {
        // Сортируем карточки по дате (на всякий случай, если сервер прислал не по порядку)
        const sortedCards = [...cards].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const firstCardDate = new Date(sortedCards[sortedCards.length - 1].createdAt);
        const lastCardDate = new Date(sortedCards[0].createdAt);
        const modalTitle = usersStatsModalWindow.querySelector(".popup__title");
        modalTitle.textContent = "Статистика пользователей";
        modalTitle.style.fontWeight = "bold";
        // Наполняем общую информацию
        usersStatsModalInfoList.append(createInfoString("Всего карточек:", cards.length));
        usersStatsModalInfoList.append(createInfoString("Первая создана:", formatDate(firstCardDate)));
        usersStatsModalInfoList.append(createInfoString("Последняя создана:", formatDate(lastCardDate)));

        // Собираем уникальных авторов карточек для списка пользователей
        const authors = {};
        cards.forEach(card => {
          authors[card.owner._id] = card.owner.name;
        });

        usersStatsModalWindow.querySelector(".popup__text").textContent = "Все пользователи:";
        
        Object.values(authors).forEach(name => {
          const userElement = userPreviewTemplate.content.cloneNode(true);
          userElement.querySelector(".popup__list-item").textContent = name;
          usersStatsModalUsersList.append(userElement);
        });
      }

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при получении статистики:", err);
    });
};

// 4. Устанавливаем слушатель на логотип
logo.style.cursor = "pointer"; // Делаем логотип кликабельным визуально
logo.addEventListener("click", handleLogoClick);