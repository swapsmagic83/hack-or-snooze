"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkupNew(story, isFavorite,isMyStory) {
  let starClass = '';
  let newClass = '';
  if(currentUser){
    if(isFavorite) {
        starClass = '<i class="fas fa-star"></i>'
    } else {
      starClass = '<i class="far fa-star"></i>'
    }
    if(isMyStory== true){
      newClass = '<i class="fas fa-trash-alt"></i>'
    }else{
      newClass='<i class=" "></i>'
    } 
  } 
  const hostName = story.getHostName();
  
  return $(`
    <li id="${story.storyId}" class="list-group-item">
    <span class="trash-alt"> 
      ${newClass}
    </span>
      <span class="star"> 
      ${starClass}
      </span>
      <a href="${story.url}" target="a_blank" class="story-link text-decoration-none">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author text-success d-block">by ${story.author}</small>
      <small class="story-user text-warning d-block">posted by ${story.username}</small>
    </li>
      `);
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  if(currentUser){
    $allStoriesList.empty();

    let favStories = currentUser.favorites;
    let favStoryIds = [];
  
    for(let favStory of favStories)
    {
      favStoryIds.push(favStory.storyId);
    }
  // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      let isFavorite = false;
      
      if(favStoryIds.includes(story.storyId)) {
        
        isFavorite = true;
      }
      let isMyStory=false
      const $story = generateStoryMarkupNew(story, isFavorite, isMyStory);
      $allStoriesList.append($story);
    } 
  }
  else if(!currentUser){
    for(let story of storyList.stories){
      let isFavorite
      let isMyStory=false
      let $story = generateStoryMarkupNew(story,isFavorite,isMyStory)
      $allStoriesList.append($story)
      
    }
  }
}

let listner = function(spanList){
  if (spanList.firstElementChild.classList.value == "far fa-star"){
    spanList.firstElementChild.classList.value = "fas fa-star"
    let storyId = spanList.parentElement.id
    let favoritesPromise = markFavoriteStory(currentUser,storyId)
    favoritesPromise.then((favorites) => {
      let favoriteStories = []
      for(let favorite of favorites) 
      {
          let story = new Story({
                        storyId: favorite.storyId, 
                        title: favorite.title, 
                        author: favorite.author,
                        url: favorite.url,
                        username: favorite.username,
                        createdAt: favorite.createdAt,
                      });
          favoriteStories.push(story);
      }
      currentUser.favorites = favoriteStories
      gengerateFavoriteStoryList()
      putStoriesOnPage()
      generateMyStoryList()
      markUnmarkStory();
    })
  } 
  else if(spanList.firstElementChild.classList.value == "fas fa-star"){
        spanList.firstElementChild.classList.value = "far fa-star"
        let storyId = spanList.parentElement.id
        let favoritesPromise = unmarkFavoriteStory(currentUser,storyId)
        favoritesPromise.then((favorites) => {
          let favoriteStories = []
          for(let favorite of favorites) 
          {
              let story = new Story({
                            storyId: favorite.storyId, 
                            title: favorite.title, 
                            author: favorite.author,
                            url: favorite.url,
                            username: favorite.username,
                            createdAt: favorite.createdAt,
                          });
              favoriteStories.push(story);
          }
          currentUser.favorites = favoriteStories
          gengerateFavoriteStoryList()
          putStoriesOnPage()
          generateMyStoryList()
          markUnmarkStory()
        })
    }
}

function markUnmarkStory(){

  let spanLists=$('.star')

  for (let i=0;i<spanLists.length;i++){
    spanLists[i].removeEventListener('click', listner);
    spanLists[i].addEventListener('click',listner.bind(null, spanLists[i]))
  } 
}

function addNewStory(){
  let author= document.querySelector('#author-name').value
  let title=document.querySelector('#story-title').value
  let url= document.querySelector('#url').value
  let storyPromise = StoryList.addStory(currentUser,{title: title, author: author, url: url})
  storyPromise.then((res) => {
    const jsonStory = JSON.stringify(res);
    storyList.stories.unshift(res)
    putStoriesOnPage()
    let promise = checkForRememberedUser();
    promise.then((res) => {
      generateMyStoryList()
      markUnmarkStory()
    })
    
  })
  
}

function gengerateFavoriteStoryList(){
  let isFavorite= true
  let isMyStory=false
  $favoriteStoryList.empty()
  for (let favStory of currentUser.favorites){
    let $favStory= generateStoryMarkupNew(favStory,isFavorite,isMyStory) 
    $favoriteStoryList.append($favStory)
  }
  if (currentUser.favorites.length==0){
    let ele=document.createElement('h1')
    ele.innerText='No favorites added!!'
    $favoriteStoryList.append(ele)
  }
}

function generateMyStoryList(){
  $myStoriesList.empty()
  let isMyStory=true
  
  for(let story of currentUser.ownStories){
      let favStoryIds=[]
      for(let favStory of currentUser.favorites)
      {
        favStoryIds.push(favStory.storyId);
      }
      if (favStoryIds.includes(story.storyId)){
          let isFavorite=true
          let myStory=generateStoryMarkupNew(story,isFavorite,isMyStory)
          $myStoriesList.append(myStory)
        
        }else{
          let isFavorite=false
          let myStory=generateStoryMarkupNew(story,isFavorite,isMyStory)
          $myStoriesList.append(myStory)
        }     
  }
  removeStoryFromMyStoryList()
  if (currentUser.ownStories.length==0){
    let ele=document.createElement('h1')
    ele.innerText='No stories added by user yet!!!'
    $myStoriesList.append(ele)
  }
}

let removeStoryListner = function(removeBtn){
  let storyId= removeBtn.parentElement.parentElement.id
  let deleteStoryPromise= deleteMyStory(storyId)
  deleteStoryPromise.then((deleteStory)=>{
    
    let myStoryList=[]
    for(let story of currentUser.ownStories){
      if (story.storyId!=deleteStory.storyId){
          myStoryList.push(story)   
      }
    }
    currentUser.ownStories=myStoryList
    generateMyStoryList()

    let newAllStories = []
    for(let story of storyList.stories){
      if(story.storyId != deleteStory.storyId){
        newAllStories.push(story)
      }
    }
    storyList.stories=newAllStories
    putStoriesOnPage()

    let newFavoriteStories=[]
    for(let story of currentUser.favorites){
      if(story.storyId != deleteStory.storyId){
        newFavoriteStories.push(story)
      }
    }
    currentUser.favorites= newFavoriteStories
    gengerateFavoriteStoryList()
    markUnmarkStory() 
  }) 
}

function removeStoryFromMyStoryList(){
  let $removebtns=$('.fa-trash-alt')
  for(let i=0;i< $removebtns.length;i++){
    $removebtns[i].removeEventListener('click', removeStoryListner)
    $removebtns[i].addEventListener('click',removeStoryListner.bind(null, $removebtns[i]))
  }
}

$navFavorite.on('click',function(e){
  e.preventDefault();
  $allStoriesList.hide();
  $favoriteStoryList.show()
  $submitForm.hide()
  $myStoriesList.hide()
})

