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

let searchResults = []
const resultList = document.querySelector("#resultList")

// color scheme constants
const checkbox = document.querySelector("input[name=darkModeToggle]")
const mainHTML = document.querySelector("html")
const metaTheme = document.querySelector("meta[name=theme-color]")

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
        if (userSettings.colorScheme == "dark") {
            checkbox.checked = true
            mainHTML.setAttribute("data-bs-theme", "dark")
        } else if (userSettings.colorScheme == "light") {
            mainHTML.setAttribute("data-bs-theme", "light")
            checkbox.checked = false
        }
    } else {
        sortBy(userSettings.filterType)
    }
}

// Dark mode controls
checkbox.addEventListener('change', function () {
    if (this.checked) {
        mainHTML.setAttribute("data-bs-theme", "dark")
        metaTheme.setAttribute("content", "#21252a")
        userSettings.colorScheme = "dark"
    } else {
        mainHTML.setAttribute("data-bs-theme", "light")
        metaTheme.setAttribute("content", "#fff")
        userSettings.colorScheme = "light"
    }
    saveSettings()
});


async function getList() {
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
    //for (let anime of myAnimeList) {
    for (let i = 0; i < myAnimeList.length; i++) {

        let anime = myAnimeList[i]
        let status = {};
        if (anime.episodes == anime.watched) {
            status.text = "Completed"
            status.class = "text-orange fw-bold"
            status.color = "text-orange"
        } else {
            status.text = "Watched"
            status.class = "text-secondary"
            status.color = ""
        }
        let localData = localStorage.getItem("myAnimeList")
        let oldIndex = JSON.parse(localData).findIndex(list => list.id == anime.id)

        // anime card
        let li = `
                <section class="list-item " id="${anime.id}">
                    <div class="position-relative rounded-3 d-flex flex-sm-column shadow overflow-hidden" style="background-color:#ffffff11;border:2px solid transparent">
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
                                            <ul class="dropdown-menu shadow">
                                                <li><a class="dropdown-item small" onclick="openEdit(${anime.id})" href="#"><i class="fa-solid fa-edit me-2"></i> Edit</a></li>
                                                <li><a class="dropdown-item small" onclick="removeAnime('${anime.id}')" href="#"><i class="fa-solid fa-trash me-2"></i> Remove</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <form id="editpanel-${anime.id}" class="editpanel" style="display:none">
                            <div class="form-floating mb-2 w-100">
                                <textarea minlength="3" type="text" class="form-control" id="inputName-${anime.id}" style="height:5rem" required>${anime.name}</textarea>
                                <label for="inputName">Anime Name</label>
                            </div>
                            <div class="form-floating mb-2  w-100">
                                <input type="number" class="form-control" min="0" max="${anime.episodes}" id="inputEpisodes-${anime.id}" value="${anime.watched}" required>
                                <label for="inputEpisodes">Watched Episodes</label>
                            </div>
                            <div class="btn-group w-100">
                                <button class="btn btn-secondary col-4" onclick="cancelEdit(${anime.id})"> Cancel
                                </button>
                                <button class="btn btn-info col-8 d-flex justify-content-center align-items-center"
                                onclick="saveEdit(${anime.id})">
                                <i class="fa-solid fa-floppy-disk me-2"></i>
                                <span>Update</span></button>
                            </div>
                        </form>
                    </div>
                    
                </section>`
        list.insertAdjacentHTML("beforeend", li)
        if (i < oldIndex) {
            listAnimation(oldIndex, i)
        }
    }
    updateLocalStorage();
}
function listAnimation(oldIndex, newIndex) {
    setTimeout(() => {
        childIndex = oldIndex + 1
        changedIndex = newIndex + 1
        let childElemOld = document.querySelector("#list > section:nth-child(" + childIndex + ")")
        childElemOld.classList.add("fade-up")
        let childElemNew = document.querySelector("#list > section:nth-child(" + changedIndex + ")")
        childElemNew.classList.add("fade-down")
    }, 0);
}


// Edit / Save 
function openEdit(id) {
    const editpanel = document.getElementById("editpanel-" + id)
    editpanel.style.display = ("flex")
}
function saveEdit(id) {
    const editpanel = document.getElementById("editpanel-" + id)
    const inputName = document.getElementById("inputName-" + id).value
    const inputEpisodes = document.getElementById("inputEpisodes-" + id).value
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    if (inputName.length < 3) {
        return
    } else {
        myAnimeList[itemIndex].name = inputName;
    }
    if (inputEpisodes > myAnimeList[itemIndex].episodes) {
        myAnimeList[itemIndex].watched = myAnimeList[itemIndex].episodes;
    } else {
        myAnimeList[itemIndex].watched = inputEpisodes;
    }

    editpanel.style.display = ("none")
    list.innerHTML = ""
    getList();
}
function cancelEdit(id) {
    const editpanel = document.getElementById("editpanel-" + id)
    editpanel.style.display = ("none")
}

// localStorage controls
function checkLocalStorage() {
    localData = localStorage.getItem("myAnimeList")
    if (localData) {
        myAnimeList = JSON.parse(localData)
    }
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
    countBlink(id)
}
function countDown(id) {
    list.innerHTML = ""
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    if (myAnimeList[itemIndex].watched > 0) {
        myAnimeList[itemIndex].watched--
    }
    getList()
    sortBy(userSettings.filterType)
    countBlink(id)
}
function countBlink(id) {
    let itemli = document.getElementById(id).firstElementChild
    itemli.classList.add("item-blink")
    setTimeout(() => { itemli.classList.remove("item-blink") }, 200)
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
// Fecth anime data
async function fetchAnimeData() {
    const spinner = document.querySelector(".spinner-border")
    spinner.classList.remove("d-none")
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
    spinner.classList.add("d-none")
}




/* TODO
    Must/Bug/Fix/Improve
    +   Remove anime frm list
    +   Search input keypress search
    +   Sort by filters
    +   Add filter and color settings to localStorage and check before page load
    
    Feature
    +   Add Anime Count
    -   anime card edit option (name, episodes, watched)
    -   Add about section
*/