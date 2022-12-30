
/* "global mutable state" */
const imgSrcArray = []
const renderedImages = []
const faveList = []

/* global functions */
const startLoading = () => {
    const searchBar = document.querySelector('aa-search-bar')
    searchBar.setAttribute('loading', 'true' ) 
}

const stopLoading = () => {
    const searchBar = document.querySelector('aa-search-bar')
    searchBar.setAttribute('loading', 'false' )
}

const imageClicked = (e) => {
    
    const aspectRatio = e.target.clientWidth / e.target.clientHeight 
    const largeImage = document.createElement('aa-image-modal')
    const addAttrs = (attrs) => {
        attrs.forEach(item => {
            largeImage.setAttribute(item.name, item.value)
        })
    }
    addAttrs(Array.from(e.target.attributes))
    aspectRatio > 1 ? largeImage.setAttribute('aspect', 'landscape') : largeImage.setAttribute('aspect', 'portrait')
    const wrapper = document.querySelector('.wrapper')
    wrapper.appendChild(largeImage)
}

const createImageEls = (obj) => {
    
    if (obj && obj.primaryImageSmall) {
    const image = document.createElement('img')
    const container = document.createElement('div')
    image.src = obj.primaryImageSmall
    image.id = obj.objectID
    image.setAttribute('pictitle', obj.title)
    image.setAttribute('artist', obj.artistDisplayName)
    image.setAttribute('date', obj.objectDate)
    image.className = 'gallery'
    image.addEventListener('click', (e) => imageClicked(e))
    container.appendChild(image)
    const imgDiv = document.querySelector('.img-div')
    imgDiv.appendChild(image)
    }
}

//only renders an image if the object exists, if it has an image source, 
//and is not already rendered:
const imageMaker = (obj) => {
    stopLoading()
    if (obj && obj.primaryImageSmall && !renderedImages.includes(obj)) {
        renderedImages.push(obj)
        createImageEls(obj)
    }  
}

const getRandomImages = () => {
   
    /* a maximum of 10 images is rendered at random: a unique random number 
    within the range of the object array length (max 300) is chosen, if
    its index in the object array renders an image, it is pushed onto rendered 
    images array. If rendered images array length reaches 10, the function ends. 
    However, it is possible that object array will be exhausted before the 
    rendered image array reaches 10, so to prevent an infinite loop, if the 
    already called numbers length equals the object array length, the function ends. */
    
    if (imgSrcArray.length > 10) {
        
        const calledNums = []
        while (calledNums.length < imgSrcArray.length && renderedImages.length < 10)
        {   
            const randomNum = Math.floor(Math.random() * imgSrcArray.length)
            if (!calledNums.includes(randomNum)) {
                calledNums.push(randomNum)
                if (imgSrcArray[randomNum]) {
                    imageMaker(imgSrcArray[randomNum])    
                }
            }
        }
    }
    else { 
        imgSrcArray.forEach(obj => { if(obj && obj.primaryImageSmall) {imageMaker(obj)} }) 
    }
}


//each objectID returns an object from a second api request. 
//This object is pushed onto an object array and 
//when Promise.all returns, getRandomImages   
//is fired to get a max of 10 random images from the object array
const getMetObjects = (resultsArray) => {

    const promiseArray = resultsArray.map(objectID => {return `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`} )
    Promise.all(promiseArray.map(item => {
       return fetch(item)
        .then((res) => res.ok ? res.json() : null) 
        .catch(console.error)
        })  
    ).then(values => {
        
        values.forEach(value => {
            if (value && value.primaryImageSmall) { imgSrcArray.push(value) }   
            }
            )
            if (imgSrcArray.length === 0) {
                document.querySelector('aa-search-bar').setAttribute('loading', 'false') 
                document.querySelector('aa-search-bar').setAttribute('error', 'true')
                }  else { getRandomImages() }
        }
    )
}


const removeImages = () => {
    const imgs = document.querySelectorAll('img')
    imgs.forEach(item => item.remove())
}

//the met api returns objectIDs for given queries, I deal with only the first 300.
//after the objectIDs are returned in an array, it is sent to getMetObjects,
//where the array is iterated over to receive the specific object corresponding 
//to the ID. Thus a second request is made to the met api for each objectID.
const metFetch = (searchItem) => {

    removeImages()
    startLoading()
    //reset global state (except favourites) with every new search:
    imgSrcArray.length = 0;
    renderedImages.length = 0;
     
    fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?/hasImages=true&tags=true&q=${searchItem}`)
    .then((res) => {return res.json()})
    .then((data) =>  {
        
        if (!data.objectIDs) {
            document.querySelector('aa-search-bar').setAttribute('error', 'true');
            document.querySelector('aa-search-bar').setAttribute('loading', 'false')
        }
        else if (data.objectIDs.length > 300)
        {getMetObjects(data.objectIDs.slice(0, 300))} else  
        {getMetObjects(data.objectIDs)}
        }
    )
    .catch(error => console.log(error)) 
    } 

//there are 2 pages, rendered using templates depending on URL hash:
const router = (first) => {
    
    const url = window.location.hash.slice(1)
    const wrapper = document.querySelector('.wrapper')
    const content = document.querySelector('.content')
    if (content) { content.remove() }
    
    if (url === 'cart') {
        
        const cartTemplate = document.querySelector('.cart')
        const cart = cartTemplate.content.cloneNode(true)
        wrapper.appendChild(cart)

    } else {
        
        const homeTemplate = document.querySelector('.home')
        const home = homeTemplate.content.cloneNode(homeTemplate)          
        wrapper.appendChild(home)
        //display placeholder image on first render:
        if (first === 'true') {

            const placeholder = document.createElement('img')
            placeholder.className = 'placeholder'
            placeholder.src = '/Gallery-Cart/assets/640px-frame.png'
            const imgDiv = document.querySelector('.img-div')
            imgDiv.appendChild(placeholder)

        } else {
            //search images are maintained between page changes:
            renderedImages.forEach(obj => createImageEls(obj)) 
        }
    }
}

window.addEventListener('hashchange', router);

//router runs as first function to make home page: 
router('true')

export { metFetch, faveList}

