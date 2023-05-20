/*  PWA Service worker register 
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
} */
// wait for the DOM
// document.addEventListener("DOMContentLoaded", checkLocalStorage)

// current list, syncs with localStorage
let myAnimeList = []

// set main list
const list = document.getElementById("list")
// checks if any local data and syncs with array
checkLocalStorage();

// USER SETTINGS
let userSettings = {
    colorScheme: "dark",
    filterType: "name"
}
checkSettings();
function saveSettings() {
    localStorage.setItem("userSettings", JSON.stringify(userSettings))
}
function checkSettings() {
    if (localStorage.getItem("userSettings")) {
        userSettings = JSON.parse(localStorage.getItem("userSettings"))
        sortBy(userSettings.filterType)
        console.log("settings parsed")
    } else {
        console.log(" no settings")
    }
}

function getList() {
    if (myAnimeList.length == 0) {
        let emptyPageTemplate = `
        <div class="w-100 d-flex flex-column justify-content-center align-items-center text-center" style="height:50vh">
        <div class="display-1 fw-bold">Animemo</div>
        <p>Add here some anime series</p>
        <button class="btn btn-lg btn-info rounded-circle w-auto" data-bs-toggle="modal"
                data-bs-target="#addAnimeModal">
                <i class="fa-solid fa-plus"></i>
        </button>
        </div>
        `
        list.insertAdjacentHTML("beforeend", emptyPageTemplate)
    }
    // Anime list counter
    let animeCount = document.querySelector("#animeCount")
    if (myAnimeList.length > 0) {
        animeCount.innerText = myAnimeList.length
    } else {
        animeCount.innerText = 0
    }

    for (let anime of myAnimeList) {
        let status = {};
        if (anime.episodes == anime.watched) {
            status.text = "Completed"
            status.class = "text-orange fw-bold"
            status.border = "text-orange"
        } else {
            status.text = "Watched"
            status.class = "text-secondary"
            status.border = ""
        }
        // anime card
        let li = `
                <div class=" list-items " id="${anime.id}">
                    <div class="rounded-3 d-flex flex-sm-column shadow-sm overflow-hidden
                    border border-2 ${status.border}">
                        <div class="col-4 col-sm-12" style="background-image:url('${anime.image}');background-size: cover; aspect-ratio:2/3">
                            
                        </div>
                        <div class="col-8 col-sm-12 d-flex flex-column justify-content-between">
                            <div class="p-2 text-center">
                                <div class="anime-name fs-5 fw-bold ">${anime.name}</div>
                            </div>
                            <ul class="list-group list-group-flush">
                            <li class="list-group-item bg-transparent">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="${status.class} small"><i class="fa-solid fa-eye"></i> ${status.text}</div>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <button type="button" onclick="countDown(${anime.id})" class="btn btn-sm">-</button>
                                            <span class="px-2 fw-bold fs-2 watched-count">${anime.watched}</span>
                                            <button type="button" onclick="countUp(${anime.id})" class="btn btn-sm">+</button>
                                        </div>
                                    </div>
                                </li>
                                <li class="list-group-item bg-transparent">
                                    <div class="d-flex justify-content-between text-secondary">
                                        <div class="small"><i class="fa-solid fa-film"></i> Episodes</div>
                                        <div>${anime.episodes}</div>
                                    </div>
                                </li>
                                <li class="list-group-item position-relative bg-transparent">
                                    <div class="d-flex flex-column text-secondary small">
                                        <div><i class="fa-regular fa-calendar-check"></i> Last Watched</div>
                                        <div>${anime.lastWatched}</div>
                                    </div>
                                    <div class="position-absolute end-0 bottom-0">
                                        <div class="btn-group">
                                            <div class="p-3 small" data-bs-toggle="dropdown" aria-expanded="false" style="cursor:pointer">
                                            <i class="fa-solid fa-ellipsis-vertical"></i>
                                            </div>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item small" onclick="removeAnime('${anime.id}')" href="#"><i class="fa-solid fa-trash"></i> Remove</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>`
        list.insertAdjacentHTML("beforeend", li)
    }
    updateLocalStorage();
}
// localStorage controls
function checkLocalStorage() {
    localData = localStorage.getItem("myAnimeList")
    if (localData) {
        myAnimeList = JSON.parse(localData)
    }
    getList();
}
function updateLocalStorage() {
    localStorage.setItem("myAnimeList", JSON.stringify(myAnimeList))
}

// Watched episodes count functions
function countUp(id) {
    list.innerHTML = ""
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    if (myAnimeList[itemIndex].watched < myAnimeList[itemIndex].episodes) {
        myAnimeList[itemIndex].watched++
        myAnimeList[itemIndex].lastWatched = new Date().toLocaleString()
    }
    getList()
    sortBy(userSettings.filterType)
}
function countDown(id) {
    list.innerHTML = ""
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    if (myAnimeList[itemIndex].watched > 0) {
        myAnimeList[itemIndex].watched--
    }
    getList()
    sortBy(userSettings.filterType)
}

// Add new Anime
class NewAnime {
    constructor(name, episode, img) {
        this.name = name
        this.episode = episode
        this.img = img
        this.date = "-"//new Date().toLocaleString()
        this.watched = 0
        this.id = Math.floor(Math.random() * 999999999)
    }
}
function addNewAnime(name, episode, img, id) {
    let payload = new NewAnime(name, episode, img)
    let addBtn = document.getElementById(id)
    addBtn.classList.remove("btn-info")
    addBtn.disabled = true
    addBtn.classList.add("btn-success")
    addBtn.firstElementChild.classList.remove("fa-plus")
    addBtn.firstElementChild.classList.add("fa-check")
    pushList(payload)
}
function pushList(payload) {
    let animeListItem = {
        "name": payload.name,
        "episodes": payload.episode,
        "watched": payload.watched,
        "image": payload.img,
        "lastWatched": payload.date,
        "id": payload.id
    }
    myAnimeList.unshift(animeListItem)
    sortBy(userSettings.filterType)
    list.innerHTML = ""
    getList()
}


// Remove Anime from list
function removeAnime(id) {
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    myAnimeList.splice(itemIndex, 1)
    list.innerHTML = ""
    getList()
}

// Sort List Function and class control
function sortBy(sortType) {
    userSettings.filterType = sortType
    let sortedList;
    // remove all classes
    let hasSortClass = document.querySelector(".sort-by-item")
    if (hasSortClass) {
        hasSortClass.classList.remove("sort-by-item")
    }
    // set menu items
    let sortbyname = document.querySelector("#sortbyname")
    let sortbylast = document.querySelector("#sortbylast")
    let sortbymost = document.querySelector("#sortbymost")

    if (sortType == "name") {
        sortedList = myAnimeList.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
        sortbyname.classList.add("sort-by-item")
    } else if (sortType == "mostwatched") {
        sortedList = myAnimeList.sort((a, b) => b.watched - a.watched);
        sortbymost.classList.add("sort-by-item")
    } else if (sortType == "lastwatched") {
        sortedList = myAnimeList.sort((a, b) => (a.lastWatched > b.lastWatched) ? -1 : ((b.lastWatched > a.lastWatched) ? 1 : 0))
        sortbylast.classList.add("sort-by-item")
    }
    list.innerHTML = ""
    myAnimeList = sortedList
    getList()
    saveSettings()
}


// Search Anime from kitsu API
let searchResults = []
const resultList = document.querySelector("#resultList")
// Fecth anime data
async function fetchAnimeData() {
    resultList.innerHTML = ""
    const searchText = document.querySelector("#searchText").value
    const response = await fetch("https://kitsu.io/api/edge/anime?filter[text]=" + searchText);
    const jsonData = await response.json();
    // set search result to array
    searchResults = jsonData.data
    if (searchResults.length > 0) {
        // loop for results
        for (let result of searchResults) {
            let li = `
            <li class="list-group-item p-0 d-flex position-relative">
                <img class="col-2" src="${result.attributes.posterImage.small}"/>
                <div class="p-3 col-10 d-flex flex-column ">
                    <div class="fw-bold">${result.attributes.titles.en_jp}</div>
                    <div class="small">${result.attributes.canonicalTitle}</div>
                    <span class="small">Episodes: ${result.attributes.episodeCount}</span>
                    <button id="${result.id}" class="rounded-circle position-absolute btn btn-sm btn-info end-0 bottom-0 m-2" style="width:2rem; height:2rem"
                    onclick="addNewAnime('${result.attributes.titles.en_jp}', ${result.attributes.episodeCount}, '${result.attributes.posterImage.medium}', ${result.id})">
                    <i class="fa-solid fa-plus"></i>
                </button>
                </div>
            </li>
            `
            resultList.insertAdjacentHTML("beforeend", li)
        }
    } else {
        resultList.innerHTML = "OOPS! Nothing found"
    }
}

// Dark mode controls
let checkbox = document.querySelector("input[name=darkModeToggle]")
let mainHTML = document.querySelector("html")
let metaTheme = document.querySelector("meta[name=theme-color]")
checkbox.addEventListener('change', function () {
    if (this.checked) {
        mainHTML.setAttribute("data-bs-theme", "dark")
        metaTheme.setAttribute("content", "#000")
        userSettings.colorScheme = "dark"
    } else {
        mainHTML.setAttribute("data-bs-theme", "light")
        metaTheme.setAttribute("content", "#fff")
        userSettings.colorScheme = "light"
    }
    saveSettings()
});



/* TODO
    +   Remove anime frm list
    -   Search input keypress search
    +   Sort by filters
    -   Add filter and color settings to localStorage and check before page load
    -   anime card edit (name, episodes, watched)
    -   Dont refresh whole list while count up or down
        (set innerHTML and update localStorage)
    -   Add about section
    -   Internet connection check PWA
    -   APP ICON
    -   Add Anime Count
*/