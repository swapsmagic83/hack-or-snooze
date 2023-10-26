"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");
const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoriteStoryList= $("#favorite-story-list")
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $navSubmit = $("#nav-submit");
const $submitForm = $("#submit-form")
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");
const $navFavorite = $('#nav-favorite');
const $navAll = $('#nav-all');
const $myStoriesList=$("#my-stories-list")
const $navMyStories = $("#nav-my-stories")

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
    console.debug("start");

    // "Remember logged-in user" and log in, if credentials in localStorage
    await checkForRememberedUser();
    await getAndShowStoriesOnStart();
    

    // if we got a logged-in user
    if (currentUser) updateUIOnUserLogin();

    $navAll.on("click", function () {
    markUnmarkStory()
      $allStoriesList.show();
      $favoriteStoryList.hide();
      $submitForm.hide()
      $myStoriesList.hide()
      $loginForm.hide()
      $signupForm.hide()
    })
    $navMyStories.on('click',function(){
      $allStoriesList.hide()
      $favoriteStoryList.hide()
      $submitForm.hide()
      $myStoriesList.show()
    })
    $navSubmit.on('click', navSubmitClick)
    $(".submit-story").on('click',clickOnSubmit)  
}


// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
