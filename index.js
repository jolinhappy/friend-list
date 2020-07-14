const panel = document.getElementById("data-panel")
const baseUrl = "https://lighthouse-user-api.herokuapp.com/api/v1/users/"
const listData = []
const searchForm = document.getElementById("search")
const searchInput = document.getElementById("search-input")
const pagination = document.getElementById("pagination")
const filter = document.getElementById("filter")
const searchOption = document.getElementById('search-select')
const homeIcon = document.getElementById("home-icon")
const ITEM_PER_PAGE = 12
const currentPage = 1
const favoritList = JSON.parse(localStorage.getItem("favoritFriend")) || []
let paginationData = []

// 整理資料到陣列，並顯示出來
axios
  .get(baseUrl)
  .then((res) => {
    listData.push(...res.data.results)
    // displayList(listData)
    getTotalPages(listData)
    getPageData(currentPage, listData)
  })
  .catch((err) => console.log(err))

// 抓出所有使用者頭像和名字來顯示(版面基本渲染)
function displayList(listData) {
  let htmlContent = "";
  listData.forEach((user) => {
    htmlContent += `
    <div class="card">
      <img src="${user.avatar}" class="avatar" data-toggle="modal" data-target=".modal" data-id="${user.id}">
      <div class="name">${user.name} ${user.surname}</div>
      <i class="fa fa-heart addHeart origin-heart" aria-hidden="true" data-id="${user.id}"></i>
    </div>
    <div class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-title"></h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" id="content">
          
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
`
  })
  panel.innerHTML = htmlContent
}

//增加詳細資訊彈窗
function showModal(event) {
  if (event.target.matches(".avatar")) {
    const id = event.target.dataset.id
    const url = baseUrl + id
    const title = document.getElementById("modal-title")
    const content = document.getElementById("content")
    // 清空資料
    title.textContent = ""
    content.innerHTML = ""
    // 再加資料
    axios
      .get(url)
      .then((res) => {
        const data = res.data
        const titleString = `${data.name} ${data.surname}'s info`
        title.textContent = titleString
        content.innerHTML = `
           <div class="modal-avatar-section">
             <img src="${data.avatar}" class="modal-avatar" data-toggle="modal" data-target=".modal" data-id="${data.id}">
           </div>
           <div class="modal-info">
             <p>birthday: ${data.birthday}</p>
             <p>age: ${data.age}</p>
             <p>region: ${data.region}</p>
             <p>email: ${data.email}</p>
           </div>
          `
      })
      .catch((err) => console.log(err))
  }
}

// 搜尋性別&地區
function searchContent(event) {
  event.preventDefault()
  const searchString = searchInput.value.toLowerCase()
  const nameResults = listData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchString) ||
      item.surname.toLowerCase().includes(searchString)
  )
  const regionResults = listData.filter(
    (item) =>
      item.region.toLowerCase().includes(searchString)
  )
  if (searchOption.value === '1') {
    getTotalPages(nameResults)
    getPageData(currentPage, nameResults)
  } else {
    getTotalPages(regionResults)
    getPageData(currentPage, regionResults)
  }
}


//加入&取消加入我的最愛
function addFavorit(event) {
  if (event.target.matches(".fa-heart")) {
    let heart = event.target
    if (heart.classList.contains("origin-heart")) {
      addFavoritData(heart.dataset.id)
      heart.classList.remove("origin-heart")
      heart.classList.add("select-heart")
    } else if (heart.classList.contains("select-heart")) {
      removeFavoritData(heart.dataset.id)
      heart.classList.remove("select-heart")
      heart.classList.add("origin-heart")
    }
  }
}

//增加&刪除我的最愛資料
function addFavoritData(id) {
  const friend = listData.find((item) => item.id === Number(id))
  if (favoritList.some((item) => item.id === Number(id))) {
    return
  } else {
    favoritList.push(friend)
  }
  localStorage.setItem("favoritFriends", JSON.stringify(favoritList))
}

function removeFavoritData(id) {
  const index = favoritList.findIndex((oneCard) => oneCard.id === Number(id))
  if (index !== -1) {
    favoritList.splice(index, 1)
  } else {
    return
  }
  localStorage.setItem("favoritFriends", JSON.stringify(favoritList))
}

// 同步資料的愛心icon狀態
function heartIcon() {
  const heartIcon = document.querySelectorAll(".addHeart")
  heartIcon.forEach((heart) => {
    let searchHearts = favoritList.some(
      (user) => user.id === Number(heart.dataset.id)
    )
    if (searchHearts) {
      heart.classList.remove("origin-heart")
      heart.classList.add("select-heart")
    } else {
      heart.classList.remove("select-heart")
      heart.classList.add("origin-heart")
    }
  })
}

function getTotalPages(data) {
  let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
  let pageItemContent = ""
  for (let i = 0; i < totalPages; i++) {
    pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${
      i + 1
      }</a>
        </li>
      `
  }
  pagination.innerHTML = pageItemContent
}

function getPageData(pageNum, data) {
  paginationData = data || paginationData
  let offset = (pageNum - 1) * ITEM_PER_PAGE
  let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
  displayList(pageData)
  heartIcon()
}

function clickPage(event) {
  if (event.target.tagName === "A") {
    getPageData(event.target.dataset.page)
  }
}

// 篩選性別及我的最愛(無搜尋&搜尋後篩選)
function filterData() {
  let filterResults = []
  const searchString = searchInput.value.toLowerCase()
  const nameResults = listData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchString) ||
      item.surname.toLowerCase().includes(searchString)
  )
  const regionResults = listData.filter(
    (item) =>
      item.region.toLowerCase().includes(searchString)
  )
  if (searchInput.value === "") {
    if (event.target.matches(".mars")) {
      filterResults = listData.filter((person) => person.gender === "male")
    } else if (event.target.matches(".venus")) {
      filterResults = listData.filter((person) => person.gender === "female")
    } else if (event.target.matches(".heart")) {
      filterResults = favoritList.map((person) => person)
    } else {
      filterResults = listData
    }
  } else {
    if (document.getElementById('search-select').value === '1') {
      if (event.target.matches(".mars")) {
        filterResults = nameResults.filter(
          (person) => person.gender === "male"
        )
      } else if (event.target.matches(".venus")) {
        filterResults = nameResults.filter(
          (person) => person.gender === "female"
        )
      } else if (event.target.matches(".heart")) {
        filterResults = favoritList.filter((item) =>
          item.name.toLowerCase().includes(searchString) ||
          item.surname.toLowerCase().includes(searchString))
      } else {
        filterResults = nameResults
      }
    } else {
      if (event.target.matches(".mars")) {
        filterResults = regionResults.filter(
          (person) => person.gender === "male"
        )
      } else if (event.target.matches(".venus")) {
        filterResults = regionResults.filter(
          (person) => person.gender === "female"
        )
      } else if (event.target.matches(".heart")) {
        filterResults = favoritList.filter((item) =>
          item.region.toLowerCase().includes(searchString))
      } else {
        filterResults = regionResults
      }
    }
  }
  getPageData(currentPage, filterResults)
  getTotalPages(filterResults)
}


//首頁
function home(event) {
  searchInput.value = ""
  getTotalPages(listData)
  getPageData(1, listData)
}


//各種事件的監聽器

panel.addEventListener("click", showModal)
pagination.addEventListener("click", clickPage)
searchForm.addEventListener("submit", searchContent)
panel.addEventListener("click", addFavorit)
filter.addEventListener("click", filterData)
homeIcon.addEventListener("click", home)
