const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentUserId
) => {
  const cardElement = getTemplate();
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;
  
  // Отображаем количество лайков
  likeCount.textContent = data.likes ? data.likes.length : 0;

  // Проверка владельца: удаляем корзину, если карточка чужая
  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(cardElement, data._id);
    });
  }

  // Проверка, лайкали ли мы эту карточку ранее
  const isLiked = data.likes.some((user) => user._id === currentUserId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Слушатель лайка
  likeButton.addEventListener("click", () => {
    onLikeIcon(likeButton, data._id, likeCount);
  });

  // Слушатель картинки
  cardImage.addEventListener("click", () => {
    onPreviewPicture({ name: data.name, link: data.link });
  });

  return cardElement;
};