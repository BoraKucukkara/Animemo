/*  PWA Service worker register */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("Animemo service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}

// current list, syncs with localStorage
let myAnimeList = []

// set main list
const list = document.getElementById("list")

let searchResults = []
const resultList = document.querySelector("#resultList")

// color scheme constants
const checkbox = document.querySelector("input[name=darkModeToggle]")
const mainHTML = document.querySelector("html")
const body = document.querySelector("body")
const metaTheme = document.querySelector("meta[name=theme-color]")
const fixedAddButton = document.querySelector("#addbuttonatbottom")


// checks if any local data than syncs with myAnimeList[]
checkLocalStorage();

// DAFEULT USER SETTINGS
let userSettings = {
    colorScheme: "dark",
    filterType: "name"
}
checkSettings();
function saveSettings() {
    localStorage.setItem("userSettings", JSON.stringify(userSettings))
}
// checks if any local user settings
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

// Main Anime list function
async function getList() {
    list.innerHTML = ""
    // Empty list template
    if (myAnimeList.length == 0) {
        fixedAddButton.classList.add("d-none")
        let emptyPageTemplate = `
        <div class="blank-page-cover">
            <div class="display-3 fw-bold text-light-emphasis">Animemo</div>
            <p class="lead text-light-emphasis fw-bold">Add here some anime series</p>
            <button class="btn btn-info col-6 col-sm-4 col-md-2" data-bs-toggle="modal" data-bs-target="#addAnimeModal">
                <i class="fa-solid fa-plus"></i> Add Anime
            </button>
        </div>
        `
        list.insertAdjacentHTML("beforeend", emptyPageTemplate)
    }
    else {fixedAddButton.classList.remove("d-none")}

    // Anime list counter
    let animeCount = document.querySelector("#animeCount")
    if (myAnimeList.length > 0) {
        animeCount.innerText = myAnimeList.length
    } else {
        animeCount.innerText = 0
    }

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

        // single anime card template
        let li = `
                <section class="list-item " id="${anime.id}">
                    <div class="position-relative rounded-3 d-flex flex-sm-column shadow overflow-hidden" style="background-color:#ffffff11;border:2px solid transparent">
                        <div class="col-4 col-sm-12 position-relative" style="background-image:url('${anime.image}');background-size: cover; aspect-ratio:2/3">
                            <div class="anime-name-oncover d-none d-sm-block">${anime.name}</div>
                        </div>
                        <div class="col-8 col-sm-12 d-flex flex-column justify-content-between">
                            <div class="text-center">
                                <div class="anime-name d-block py-2 d-sm-none">${anime.name}</div>
                            </div>
                            <ul class="list-group list-group-flush">
                            <li class="list-group-item bg-transparent">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="${status.class} small"><i class="fa-solid fa-eye d-none d-sm-inline"></i> ${status.text}</div>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <button type="button" onclick="countDown(${anime.id})" class="btn btn-sm border">-</button>
                                            <span class="px-2 fw-bold fs-2 watched-count">${anime.watched}</span>
                                            <button type="button" onclick="countUp(${anime.id})" class="btn btn-sm border">+</button>
                                        </div>
                                    </div>
                                </li>
                                <li class="list-group-item bg-transparent">
                                    <div class="d-flex justify-content-between text-secondary">
                                        <div class="small"><i class="fa-solid fa-film d-none d-sm-inline"></i> Episodes</div>
                                        <div>${anime.episodes}</div>
                                    </div>
                                </li>
                                <li class="list-group-item position-relative bg-transparent">
                                    <div class="d-flex flex-column text-secondary small">
                                        <div><i class="fa-regular fa-calendar-check d-none d-sm-inline"></i> Last Watched</div>
                                        <div>${anime.lastWatched}</div>
                                    </div>
                                    <!-- Anime card menu btn -->
                                    <div class="position-absolute end-0 bottom-0">
                                        <div class="btn-group">
                                            <div class="p-3 small" data-bs-toggle="dropdown" aria-expanded="false" style="cursor:pointer" aria-label="Anime settings">
                                            <i class="fa-solid fa-ellipsis-vertical"></i>
                                            </div>
                                            <ul class="dropdown-menu shadow">
                                                <li><button type="button" class="dropdown-item" onclick="openEdit(${anime.id})"><i class="fa-solid fa-edit me-2"></i> Edit</button></li>
                                                <li><button type="button" class="dropdown-item" onclick="removeAnime('${anime.id}')"><i class="fa-solid fa-trash me-2"></i> Remove</button></li>
                                                <li><hr class="dropdown-divider"></li>
                                                <li>
                                                <button type="button" class="dropdown-item small" onclick="shareMe('${anime.name}','${anime.watched}','${anime.id}')">
                                                <i class="fa-solid fa-share me-2"></i> Share</button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <!-- Edid Panel -->
                        <form id="editpanel-${anime.id}" class="editpanel" style="display:none">
                            <div class="form-floating mb-2 w-100">
                                <textarea minlength="3" type="text" class="form-control" id="inputName-${anime.id}" style="height:5rem" required>${anime.name}</textarea>
                                <label for="inputName-${anime.id}">Anime Name</label>
                            </div>
                            <div class="form-floating mb-2  w-100">
                                <input type="number" class="form-control" min="0" max="${anime.episodes}" id="inputEpisodes-${anime.id}" value="${anime.watched}" required>
                                <label for="inputEpisodes-${anime.id}">Watched Episodes</label>
                            </div>
                            <div class="btn-group w-100">
                                <button type="button" class="btn btn-secondary btn-sm col-4 small" onclick="cancelEdit(${anime.id})"> Cancel
                                </button>
                                <button type="button" class="btn btn-info btn-sm col-8 d-flex justify-content-center align-items-center"
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
    // Updates localStorage anime list
    updateLocalStorage();
}

// Reorder list animation class
function listAnimation(oldIndex, newIndex) {
    setTimeout(() => {
        childIndex = oldIndex + 1
        changedIndex = newIndex + 1
        let childElemOld = document.querySelector("#list > section:nth-child(" + childIndex + ")")
        if (childElemOld) childElemOld.classList.add("fade-up")
        let childElemNew = document.querySelector("#list > section:nth-child(" + changedIndex + ")")
        childElemNew.classList.add("fade-down")
    }, 10);
}

// Add anime by Url Params (shared link like https://animemo.netlify.app/?anime=11)
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const animeID = urlParams.get('anime')
if (animeID) addbyURLparams(animeID);

async function addbyURLparams(animeID) {
    let response = await fetch("https://kitsu.io/api/edge/anime/" + animeID)
    let itemID = myAnimeList.find(list => list.id == animeID)
    if (response.ok && !itemID || itemID.id != animeID) {
        let jsonData = await response.json();
        animeData = jsonData.data
        let payload = new NewAnime(animeData.attributes.titles.en_jp, animeData.attributes.episodeCount, animeData.attributes.posterImage.medium, animeData.id)
        pushList(payload)
    }
}

// Share on device (if navigator.share not allowed, shares on twitter)
function shareMe(title, episode, id) {
    const shareData = {
        title: "Animemo",
        text: "I just watched " + title + ", episode: " + episode,
        url: "https://animemo.netlify.app/?anime=" + id,
    }
    if ('share' in navigator) {
        navigator.share(shareData)
            .then(() => {
                console.log('Shared');
            })
            .catch(console.error);
    } else {
        window.open('https://twitter.com/intent/tweet?text=I%20just%20watched%20' + title + '%20episode:%20' + episode + '%20%23animemo%20https%3A%2F%2Fanimemo.netlify.app/?anime=' + id, '_blank');
    }
}

// Edit / Save features
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
        if(inputEpisodes == 0 || inputEpisodes < myAnimeList[itemIndex].watched )
        myAnimeList[itemIndex].lastWatched = "-"
        else {myAnimeList[itemIndex].lastWatched = new Date().toLocaleString()}
    }

    editpanel.style.display = ("none")
    sortBy(userSettings.filterType)
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
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    if (myAnimeList[itemIndex].watched > 0) {
        myAnimeList[itemIndex].watched--
    }
    if (myAnimeList[itemIndex].watched === 0) myAnimeList[itemIndex].lastWatched = "-"
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
    constructor(name, episode, img, id) {
        this.name = name
        this.episode = episode
        this.img = img
        this.date = "-"//new Date().toLocaleString()
        this.watched = 0
        this.id = id
    }
}
function addNewAnime(name, episode, img, id) {
    let payload = new NewAnime(name, episode, img, id)
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
    getList()
}

// Remove Anime from list
function removeAnime(id) {
    let itemIndex = myAnimeList.findIndex(list => list.id == id)
    myAnimeList.splice(itemIndex, 1)
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
    myAnimeList = sortedList
    getList()
    saveSettings()
}

// Search Anime from kitsu API
// Fecth anime data
async function fetchAnimeData(type) {
    const spinner = document.querySelector(".spinner-border") // load spinner
    spinner.classList.remove("d-none")
    resultList.innerHTML = ""
    const searchText = document.querySelector("#searchText").value
    let response;
    if (type == "mostPopular") {
        response = await fetch("https://kitsu.io/api/edge/anime?page%5Blimit%5D=20&page%5Boffset%5D=0&sort=popularityRank,popularityRank");
    } else if (type == "mostRating") {
        response = await fetch("https://kitsu.io/api/edge/anime?page%5Blimit%5D=20&page%5Boffset%5D=0&sort=-averageRating,-averageRating");
    } else {
        response = await fetch("https://kitsu.io/api/edge/anime?page%5Blimit%5D=20&page%5Boffset%5D=0&filter[text]=" + searchText);
    }
    const jsonData = await response.json();
    // set search result to array
    searchResults = jsonData.data
    if (searchResults.length > 0) {
        // loop for search results
        for (let result of searchResults) {
            let li = `
            <li class="list-group-item p-0 d-flex position-relative">
                <img class="col-2" src="${result.attributes.posterImage.small}"/>
                <div class="px-3 py-1 py-sm-2 col-10 d-flex flex-column ">
                    <div class="fw-bold">${result.attributes.titles.en_jp}</div>
                    <div class="small">${result.attributes.canonicalTitle}</div>
                    <span class="small">Episodes: ${result.attributes.episodeCount}</span>
                    <div>
                        <span class="badge w-auto bg-body-secondary text-secondary-emphasis">Rating: ${result.attributes.averageRating}</span>
                        <span class="badge w-auto bg-body-secondary text-secondary-emphasis">Popularity: # ${result.attributes.popularityRank}</span>
                    </div>
                    
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
        resultList.innerHTML = "OOPS! Nothing found >_<"
    }
    spinner.classList.add("d-none")
}
// Search helper datalist 
const datalistOptions = [
    "Fullmetal Alchemist Brotherhood",
    "Boku No Hero Academia",
    "Kimi No Na Wa.",
    "Death Note",
    "Attack on Titan",
    "Shingeki no Kiyojin",
    "Steins Gate",
    "One Piece",
    "Your Lie in April",
    "Code Geass",
    "One Punch-Man",
    "Koe No Katachi",
    "No Game No Life",
    "Fairy Tail",
    "Naruto",
    "Tokyo Ghoul",
    "Cowboy Bebop",
    "Hunterxhunter",
    "Assassination Classroom",
    "Gintama",
    "Haikyuu",
    "Gurren Lagann",
    "Jojo's Bizarre Adventure",
    "Spirited Away",
    "Re:Zero",
    "Yuri on Ice",
    "Neon Genesis Evangelion",
    "Madoka Magica",
    "Hunterxhunter 2011",
    "Sword Art Online",
    "Angel Beats",
    "Black Butler",
    "Konosuba",
    "Clannad After Story",
    "Noragami",
    "Dragon Ball Z",
    "Mob Psycho 100",
    "Toradora",
    "Soul Eater",
    "Fate/Zero",
    "Ouran Highschool Host Club",
    "Fullmetal Alchemist",
    "Bleach",
    "Kill La Kill",
    "Clannad",
    "Death Parade",
    "Durarara",
    "Monogatari Series: Second Season",
    "Psycho-Pass",
    "Mirai Nikki",
    "Erased",
    "Bakemonogatari",
    "Princess Mononoke",
    "Food Wars: Shokugeki No Soma",
    "High School Dxd",
    "Howl's Moving Castle",
    "Wolf Children",
    "Inuyasha",
    "Anohana",
    "Love Live School Idol Project",
    "Blue Exorcist",
    "Nichijou",
    "Sailor Moon",
    "Code Geass: Lelouch of the Rebel,ion" >
    "Miss Kobayashi's Dragon Maid",
    "Bungou Stray Dogs",
    "Baccano",
    "The Seven Deadly Sins",
    "Shinsekai Yori",
    "Monster",
    "Samurai Champloo",
    "Fooly Cooly",
    "Spice and Wolf",
    "Another",
    "Dragon Ball",
    "Mushishi",
    "Akira",
    "Pokemon",
    "Natsume Yuujinchou",
    "Terror in Resonance",
    "Kuroko No Basket",
    "Ghost in the Shell",
    "Hyouka",
    "Higurashi When They Cry",
    "Akame Ga Kill",
    "Seraph of the End",
    "Charlotte",
    "Yona of the Dawn",
    "Yu Yu Hakusho",
    "Katekyo Hitman Reborn",
    "The Pet Girl of Sakurasou",
    "Hellsing",
    "Magi",
    "Berserk",
    "Cardcaptor Sakura",
    "Log Horizon",
    "Elfen Lied",
    "Lucky Star",
    "Free - Iwato"
]
const animemoDatalist = document.getElementById("animemoDatalist")
for (let i = 0; i < datalistOptions.length; i++) {
    let optionElement = `<option value="${datalistOptions[i]}">`
    animemoDatalist.insertAdjacentHTML("beforeend", optionElement)
}