import { metFetch, faveList} from '/Gallery-Cart/main.js'

/* search bar: */
class SearchBar extends HTMLElement {
    // Specify observed attributes so that
    // attributeChangedCallback will work
    static get observedAttributes() {
      return ['loading', 'error'];
    }
  
    constructor() {
      // Always call super first in constructor
      super();
  
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = `
      <style>

        .search-bar {
            color: white; 
            font-family: 'SFProDisplay', Arial, Helvetica, sans-serif;
            margin-left: 33%;
          }

        .search-input {
            border-radius: 50px;
            border: 2px solid white;
            font-size: 1rem;
            padding: .5rem;
            background-color: black;
            color: white;
        }

        input#invalid {
            border: 2px solid red;
        }

        .search-form {
          display: flex;
          justify-content: space-between;
          width: clamp(300px, 100%, 700px)
        }

        .search-btn {
          margin-left: .5rem;
          width: fit-content;
          height: fit-content;
          padding: 0;
          border: none; 
          color: white;
          background-color: black;
          font-family: 'NeueMontreal-Medium', Arial, Helvetica, sans-serif;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .loading {
          display: none;
          opacity: 1;
          animation: fade 2s linear;
          animation-iteration-count: 10;
        }

        @keyframes fade {
          0%, 100% { opacity: 0 }
          50% { opacity: 1 }
        }

        .error {
          display: none;
        }

        @media screen and (max-width: 400px) { 
          .search-bar {
            margin-left: 0;
            width: fit-content;
          }   
        }
            
        </style>

        <article class="search-bar">
          <div class='search-form'>
            <div class='search-entry'>
                <h3>Please enter search term <br> (no numbers or symbols)</h3>
                <div class='input'>
                  <input class="search-input"/><button class="search-btn">get</button>
                </div>   
            </div>    
          </div>  
          <p class='loading'>fetching your request...<p>
          <p class='error'>no results, try something else!<p>
        </article>
        `
        this.getImgBtn = this.shadowRoot.querySelector('.search-btn')
        this.input = this.shadowRoot.querySelector('.search-input')
    }

    searchItem = () => {

      this.input.id = ''
      const regex = /[^a-z+^A-Z+\s]/
      if (regex.test(this.input.value)) {
        this.input.id = 'invalid'
      } else {
        this.setAttribute('error', 'false')
        metFetch(this.input.value)
      }
    }

    connectedCallback() {
       
        this.getImgBtn.addEventListener('click', this.searchItem)
        this.input.addEventListener("keypress", (event) => {
          // If the user presses the "Enter" key on the keyboard
          if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            this.getImgBtn.click();
          }
        });
        //best practice *not* to set class here, ie. this.className = 'modal-component'
    }
  
    attributeChangedCallback(name, oldValue, newValue) {

      if (name === 'loading') {
        const loadingText = this.shadowRoot.querySelector('.loading')
        newValue === 'true'? loadingText.style.display = 'block' : loadingText.style.display = 'none'
      } else {
        const errorText = this.shadowRoot.querySelector('.error')
        newValue === 'true'? errorText.style.display = 'block' : errorText.style.display = 'none'
      }
    }
  } 
  customElements.define('aa-search-bar', SearchBar);


  /* large image modal */
  class ImageModal extends HTMLElement {
  
    constructor() {
      // Always call super first in constructor
      super();
      
      this.attachShadow({mode: 'open'});
  
    }

    closeImageModal() {
      this.remove()
    }

    saveToFaves() {
      //if item already favourited, it is still added, but same
      //images are grouped together:
      const listIndex = faveList.findIndex(obj => obj.id === this.id)
      if (listIndex > -1) {
       faveList.splice(listIndex, 0, this)
      } else {
        faveList.push(this)
      }

      this.saveBtn.disabled = true
      this.saveBtn.style.color = 'lightgrey'
      this.saveBtn.innerText = `saved ${String.fromCharCode(10003)}`;
    }

    connectedCallback() {
      
      this.shadowRoot.innerHTML = `
      <style>
        .image-modal {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background-color: rgba(0, 0, 0, .80);
        }

        .image-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-left: auto;
          margin-right: auto;   
        }

        .large-image {
          ${this.attributes.aspect.value === 'landscape' ? `width: clamp(300px, 100vw, 900px);` : `height: clamp(300px, 80vh, 900px);`}   
        }

        .image-info {
          margin-top: .5rem;
        }

        .image-modal p {
          color: white;
          margin: 0 3rem;
          line-height: 1.5;
        }

        button {
          width: fit-content;
          height: fit-content;
          padding: 0;
          border: none; 
          color: white;
          background-color: transparent;
          font-family: 'NeueMontreal-Medium', Arial, Helvetica, sans-serif;
          font-size: 1.5rem;
          cursor: pointer;
          margin: .5rem;
        }

      </style>

      <div class="image-modal">
        <div class="image-card">
          <img class="large-image" src="${this.attributes.src.value}"/>
          <div class='image-info'>
            <p class='image-title'>"${this.attributes.pictitle && this.attributes.pictitle.value.length > 1 ? this.attributes.pictitle.value : '[untitled]'}"</p>
            <p class='image-artist'>By: ${this.attributes.artist && this.attributes.artist.value.length > 1 ? this.attributes.artist.value : '[unknown] '}, ${this.attributes.date && this.attributes.artist.value.length > 1 ? this.attributes.date.value : '[date unknown]'}</p>
          </div>
          <div class="btns">
            <button class="close-image-modal">close image</button>
            <button class="save-image">save to cart</button>
          </div>
        </div>
      </div>
      `

      this.closeBtn = this.shadowRoot.querySelector('.close-image-modal')
      this.saveBtn = this.shadowRoot.querySelector('.save-image')
      this.closeBtn.addEventListener('click', this.closeImageModal.bind(this))
      this.saveBtn.addEventListener('click', this.saveToFaves.bind(this))
      if (this.attributes.faveimage) {
        this.saveBtn.style.display = 'none'
      }
    } 
  }
  customElements.define('aa-image-modal', ImageModal)


/* header */
  class AaHeader extends HTMLElement {
   
    constructor() {
      // Always call super first in constructor
      super();
  
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = `
      <style>

        header {
          background-color: black;
          color: white;
          padding: 4rem;
          display: flex;
          font-family: "NeueMontreal-Medium", Arial, Helvetica, sans-serif;   
        }

        .header-title {  
          font-size: 4rem;
          margin: 0;
        }

        .header-cart {
          margin-left: auto;
          font-size: 1em;
        }

        .my-cart {
          display: flex;
          flex-direction: column;
        }

        a {
          text-decoration: none;
          color: white;
        }

        p {
          margin: 0;
        }

        img {
          width: 25px;
          padding-top: .15rem;
        }

        @media screen and (max-width: 400px) {
          header {
            padding: 2rem;
          }
          .header-title {
              font-size: 3rem;
              margin-right: 2rem;
          }
        }
        
      </style>

        <header>
          <a href='#main'><h1 class="header-title">Search the Met</h1></a>
          <a class="header-cart" href='#cart'>
            <div class='my-cart'>
              <p>My Cart</p><img src='/Gallery-Cart/assets/shopping-cart-03.svg'/>
            </div>
          </a>
        </header>
      `
    }
  }
  customElements.define('aa-header', AaHeader)


/* cart */
  class Cart extends HTMLElement {
   
    constructor() {
      // Always call super first in constructor
      super();
  
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = `
      <style>

      .fave-list {
        min-height: 125vh;   
      }

        .fave-image {
          max-width: 100px;
          max-height: 100px;
        }

        .fave-list-item {
          display: inline-block;
          margin-right: 2rem;
          margin-bottom: 2rem;
          color: white;
          font-family: 'SFProDisplay', Arial, Helvetica, sans-serif;
          max-width: 50%;
        }
        
        .fave-list-image {
          display: flex;
          align-items: center;
        }

        .placeholder{
          display: block;
          margin-left: auto;
          margin-right: auto;
          max-height: 80vh;
        }

        button {
          width: fit-content;
          height: fit-content;
          padding: 0;
          border: none; 
          color: white;
          background-color: transparent;
          font-family: 'NeueMontreal-Medium', Arial, Helvetica, sans-serif;
          cursor: pointer;
          margin: .5rem;
        }

        .delete-icon {
          width: 25px;
          background-color: transparent;
        }

        .title {
          color: white;
          font-family: 'NeueMontreal-Medium', Arial, Helvetica, sans-serif;
          font-size: 1.5rem;
          margin-top: 0;
          margin-bottom: 2rem;
          text-align: center;
        }

        @media screen and (max-width: 400px) {
          .delete-icon: {
            width: 25px;
          }

          .placeholder{
            display: block;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 2rem;
            max-width: 100%;
          }
        }

      </style>

      <article class="cart-faves">
        <p class='title'>My Cart - Favourites</p> 
        <div class="fave-list"> 
          <img src='/Gallery-Cart/assets/640px-frame.png' class='placeholder'/> 
        </div>
      </article>
      `
    }

    removeItem = (e) => {

      e.currentTarget.parentElement.parentElement.remove()
      const indexNum = faveList.findIndex(obj => obj.id === e.target.id)
      faveList.splice(indexNum, 1)
    }

    faveImageModal = (e) => {
      
      const faveImage = document.createElement('aa-image-modal')
      faveImage.setAttribute('faveimage', 'true')
      faveImage.setAttribute('src', e.target.src)
      faveImage.setAttribute('pictitle', e.target.attributes.pictitle.value)
      faveImage.setAttribute('artist', e.target.attributes.artist.value)
      faveImage.setAttribute('date', e.target.attributes.date.value)
      const aspectRatio = e.target.clientWidth / e.target.clientHeight
      aspectRatio > 1 ? faveImage.setAttribute('aspect', 'landscape') : faveImage.setAttribute('aspect', 'portrait')
      const wrapper = document.querySelector('.wrapper')
      wrapper.appendChild(faveImage)
    }

    connectedCallback() {
      const faveListItemTemplate = document.querySelector('.fave-item')
      const placeholder = this.shadowRoot.querySelector('.placeholder')
      if (faveList.length > 0) { placeholder.style.display = 'none' }
      faveList.forEach((obj) => {
      
        const faveListItem = faveListItemTemplate.content.cloneNode(true)
        const faveImage = faveListItem.querySelector('img')
        faveImage.src = obj.attributes.src.nodeValue
        faveImage.setAttribute('pictitle', obj.attributes.pictitle.value)
        faveImage.setAttribute('artist', obj.attributes.artist.value)
        faveImage.setAttribute('date', obj.attributes.date.value)
        faveImage.addEventListener('click', (e) => this.faveImageModal(e))
        faveListItem.querySelector('p').innerText = obj.attributes.pictitle.nodeValue
        faveListItem.querySelector('button').addEventListener('click', (e) => this.removeItem(e))
        faveListItem.querySelector('button').id = obj.id
        this.shadowRoot.querySelector('.fave-list').appendChild(faveListItem) 
      })
    }
  }
  customElements.define('aa-cart', Cart)

  