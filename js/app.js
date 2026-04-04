const API = "https://dummyjson.com/posts";
const DEFAULT_AVATAR = "https://dummyjson.com/icon/user/80";
const POST_PREVIEW_LIMIT = 160;

const postsContainer = document.getElementById("postsContainer");
const uiState = document.getElementById("uiState");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchType = document.getElementById("searchType");
const clearBtn = document.getElementById("clearBtn");

const profileNameInput = document.getElementById("profileNameInput");
const postInput = document.getElementById("postInput");
const publishBtn = document.getElementById("publishBtn");
const createFeedback = document.getElementById("createFeedback");

const detailView = document.getElementById("detailView");
const backToPostsBtn = document.getElementById("backToPostsBtn");

const detailMeta = document.getElementById("detailMeta");
const detailAvatar = document.getElementById("detailAvatar");
const detailAuthor = document.getElementById("detailAuthor");
const detailUsername = document.getElementById("detailUsername");
const detailBody = document.getElementById("detailBody");

const POSTS_PER_PAGE = 10;

let apiPosts = [];
let localPosts = [];
let searchActive = false;
let activeSourceCard = null;
let nextLocalId = null;
let currentPage = 1;
let currentPosts = [];

function showState(message) {
  postsContainer.innerHTML = "";
  uiState.textContent = message;
  uiState.classList.add("visible");
}

function paginatePosts(posts) {
  currentPosts = posts;

  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  return posts.slice(start, end);
}

function clearState() {
  uiState.textContent = "";
  uiState.classList.remove("visible");
}

function normalizeApiPost(post, usersMap) {
  const user = usersMap?.[post.userId];

  return {
    id: post.id,
    author: user
      ? `${user.firstName} ${user.lastName}`
      : `Usuario ${post.userId}`,
    username: user
      ? `@${user.username}`
      : `@user${post.userId}`,
    avatar: user?.image || DEFAULT_AVATAR,
    body: post.body || ""
  };
}

function getAllPosts() {
  return [...localPosts, ...apiPosts];
}

function initializeNextLocalId() {
  if (nextLocalId !== null) {
    return;
  }

  const maxApiId = apiPosts.reduce((max, post) => {
    return typeof post.id === "number" && post.id > max ? post.id : max;
  }, 0);

  nextLocalId = maxApiId + 1;
}

function openDetail(post, sourceCard) {
  detailMeta.textContent = `Post #${post.id}`;
  detailAvatar.src = post.avatar || DEFAULT_AVATAR;
  detailAvatar.alt = `Foto de ${post.author}`;
  detailAuthor.textContent = post.author;
  detailUsername.textContent = post.username || "";
  detailBody.textContent = post.body || "";

  detailAvatar.dataset.shared = `avatar-${post.id}`;
  detailAuthor.dataset.shared = `author-${post.id}`;
  detailUsername.dataset.shared = `username-${post.id}`;
  detailBody.dataset.shared = `body-${post.id}`;

  detailView.classList.remove("hidden");
  detailView.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  requestAnimationFrame(() => {
    detailView.classList.add("is-open");
    animateSharedElements(sourceCard, post.id);
  });
}

function closeDetail() {
  if (!detailView.classList.contains("is-open")) {
    return;
  }

  animateSharedElementsBack(activeSourceCard);
  detailView.classList.remove("is-open");

  setTimeout(() => {
    detailView.classList.add("hidden");
    detailView.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }, 300);
}

function renderPosts(posts) {
  currentPosts = posts;
  const paginatedPosts = paginatePosts(posts);

  postsContainer.innerHTML = "";

  if (!posts || posts.length === 0) {
    showState("No se encontraron posts");
    renderPagination(0);
    return;
  }

  clearState();

  paginatedPosts.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card clickable-post";
    card.dataset.postId = String(post.id);

    const header = document.createElement("div");
    header.className = "post-header";

    const avatar = document.createElement("img");
    avatar.className = "post-avatar";
    avatar.src = post.avatar || DEFAULT_AVATAR;
    avatar.alt = `Foto de ${post.author}`;

    const authorBox = document.createElement("div");
    authorBox.className = "post-author-box";

    const author = document.createElement("div");
    author.className = "post-author";
    author.textContent = post.author;

    const username = document.createElement("div");
    username.className = "post-username";
    username.textContent = post.username || "";

    const fullBody = post.body || "";
    const shouldTruncate = fullBody.length > POST_PREVIEW_LIMIT;
    const previewText = shouldTruncate
      ? fullBody.slice(0, POST_PREVIEW_LIMIT).trim() + "..."
      : fullBody;

    const message = document.createElement("div");
    message.className = "post-body";
    message.textContent = previewText;

    avatar.dataset.shared = `avatar-${post.id}`;
    author.dataset.shared = `author-${post.id}`;
    username.dataset.shared = `username-${post.id}`;
    message.dataset.shared = `body-${post.id}`;

    authorBox.appendChild(author);
    authorBox.appendChild(username);

    header.appendChild(avatar);
    header.appendChild(authorBox);

    card.appendChild(header);
    card.appendChild(message);

    if (shouldTruncate) {
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "post-toggle-btn";
      toggleBtn.textContent = "Ver más";

      toggleBtn.addEventListener("click", event => {
        event.stopPropagation();
        activeSourceCard = card;
        openDetail(post, card);
      });

      card.appendChild(toggleBtn);
    }

    card.addEventListener("click", () => {
      activeSourceCard = card;
      openDetail(post, card);
    });

    postsContainer.appendChild(card);
  });

  renderPagination(currentPosts.length);
}

async function buildUsersMap() {
  const usersResponse = await fetch("https://dummyjson.com/users?limit=0");

  if (!usersResponse.ok) {
    throw new Error("Error cargando usuarios");
  }

  const usersData = await usersResponse.json();
  const usersMap = {};

  usersData.users.forEach(user => {
    usersMap[user.id] = user;
  });

  return usersMap;
}

async function loadPosts() {
  searchActive = false;
  showState("Cargando posts...");

  try {
    const [postsResponse, usersMap] = await Promise.all([
      fetch(API),
      buildUsersMap()
    ]);

    if (!postsResponse.ok) {
      throw new Error("Error al cargar posts");
    }

    const postsData = await postsResponse.json();

    apiPosts = postsData.posts.map(post =>
      normalizeApiPost(post, usersMap)
    );

    initializeNextLocalId();
    renderPosts(getAllPosts());
  } catch (error) {
    showState("Error cargando posts");
  }
}

async function searchPosts() {
  const type = searchType.value;
  const value = searchInput.value.trim();

  if (value === "") {
    searchActive = false;
    renderPosts(getAllPosts());
    return;
  }

  searchActive = true;
  showState("Buscando...");

  try {
    if (type === "id") {
      const numericValue = Number(value);

      if (Number.isNaN(numericValue)) {
        renderPosts([]);
        return;
      }

      const localMatches = localPosts.filter(post => post.id === numericValue);
      const apiMatches = apiPosts.filter(post => post.id === numericValue);

      renderPosts([...localMatches, ...apiMatches]);
      return;
    }

    const lowerValue = value.toLowerCase();

    if (type === "text") {
      const localResults = localPosts.filter(post =>
        post.body.toLowerCase().includes(lowerValue)
      );

      const apiResults = apiPosts.filter(post =>
        post.body.toLowerCase().includes(lowerValue)
      );

      renderPosts([...localResults, ...apiResults]);
      return;
    }

    if (type === "author") {
      const localResults = localPosts.filter(post =>
        post.author.toLowerCase().includes(lowerValue)
      );

      const apiResults = apiPosts.filter(post =>
        post.author.toLowerCase().includes(lowerValue)
      );

      renderPosts([...localResults, ...apiResults]);
      return;
    }

    renderPosts([]);
  } catch (error) {
    showState("Error en búsqueda");
  }
}

async function createPost() {
  const author = profileNameInput.value.trim();
  const body = postInput.value.trim();

  if (author === "") {
    createFeedback.textContent = "Debes ingresar un nombre de usuario antes de publicar.";
    profileNameInput.focus();
    return;
  }

  if (body === "") {
    createFeedback.textContent = "Escribe un mensaje antes de publicar.";
    postInput.focus();
    return;
  }

  createFeedback.textContent = "Publicando...";

  try {
    const response = await fetch(`${API}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "post",
        body: body,
        userId: 1
      })
    });

    if (!response.ok) {
      throw new Error("Error al publicar");
    }

    await response.json();

    initializeNextLocalId();

    localPosts.unshift({
      id: nextLocalId++,
      author: author,
      username: "@localuser",
      avatar: DEFAULT_AVATAR,
      body: body
    });

    postInput.value = "";
    createFeedback.textContent = "Post publicado";

    if (searchActive && searchInput.value.trim() !== "") {
      await searchPosts();
    } else {
      renderPosts(getAllPosts());
    }
  } catch (error) {
    createFeedback.textContent = "Error publicando";
  }
}

function animateSharedElements(sourceCard, postId) {
  if (!sourceCard) {
    return;
  }

  const pairs = [
    {
      from: sourceCard.querySelector(`[data-shared="avatar-${postId}"]`),
      to: detailAvatar
    },
    {
      from: sourceCard.querySelector(`[data-shared="author-${postId}"]`),
      to: detailAuthor
    },
    {
      from: sourceCard.querySelector(`[data-shared="username-${postId}"]`),
      to: detailUsername
    },
    {
      from: sourceCard.querySelector(`[data-shared="body-${postId}"]`),
      to: detailBody
    }
  ];

  pairs.forEach(({ from, to }) => {
    if (!from || !to) {
      return;
    }

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    const deltaX = fromRect.left - toRect.left;
    const deltaY = fromRect.top - toRect.top;
    const scaleX = fromRect.width / toRect.width;
    const scaleY = fromRect.height / toRect.height;

    to.animate(
      [
        {
          transformOrigin: "top left",
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
          opacity: 0.85
        },
        {
          transformOrigin: "top left",
          transform: "translate(0, 0) scale(1, 1)",
          opacity: 1
        }
      ],
      {
        duration: 360,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both"
      }
    );
  });
}

function animateSharedElementsBack(sourceCard) {
  if (!sourceCard) {
    return;
  }

  const postId = sourceCard.dataset.postId;

  const pairs = [
    {
      from: detailAvatar,
      to: sourceCard.querySelector(`[data-shared="avatar-${postId}"]`)
    },
    {
      from: detailAuthor,
      to: sourceCard.querySelector(`[data-shared="author-${postId}"]`)
    },
    {
      from: detailUsername,
      to: sourceCard.querySelector(`[data-shared="username-${postId}"]`)
    },
    {
      from: detailBody,
      to: sourceCard.querySelector(`[data-shared="body-${postId}"]`)
    }
  ];

  pairs.forEach(({ from, to }) => {
    if (!from || !to) {
      return;
    }

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    const deltaX = toRect.left - fromRect.left;
    const deltaY = toRect.top - fromRect.top;
    const scaleX = toRect.width / fromRect.width;
    const scaleY = toRect.height / fromRect.height;

    from.animate(
      [
        {
          transformOrigin: "top left",
          transform: "translate(0, 0) scale(1, 1)",
          opacity: 1
        },
        {
          transformOrigin: "top left",
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
          opacity: 0.85
        }
      ],
      {
        duration: 280,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "both"
      }
    );
  });
}

searchBtn.addEventListener("click", searchPosts);

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchActive = false;
  renderPosts(getAllPosts());
});

publishBtn.addEventListener("click", createPost);

if (backToPostsBtn) {
  backToPostsBtn.addEventListener("click", closeDetail);
}

profileNameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    postInput.focus();
  }
});

postInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && event.ctrlKey) {
    createPost();
  }
});

searchType.addEventListener("change", () => {
  if (searchType.value === "text") {
    searchInput.placeholder = "Buscar en el contenido del post";
  } else if (searchType.value === "author") {
    searchInput.placeholder = "Buscar por nombre del usuario";
  } else {
    searchInput.placeholder = "Buscar post por ID";
  }
});

loadPosts();