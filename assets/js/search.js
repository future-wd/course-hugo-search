import Fuse from 'fuse.js/dist/fuse.basic.esm.js'

const searchInput = document.getElementById('js-searchInput');
const searchResults = document.getElementById('js-searchResults');

// ***********************
// GET json search index with XHR
//
function getJSON(path, callback, errorCallback, timeout = 4000) {
  // 1. new instance
  const xhr = new XMLHttpRequest();
  // 2. open and configure
  xhr.open('GET', path);
  // 3. send
  xhr.send();
  // 4. conditional after data is sent and received
  xhr.onloadend = () => {
    if (xhr.status === 200) { //success
      const data = JSON.parse(xhr.responseText);
      if (callback) {
        callback(data);
      }
    } else { //fail
      errorCallback();
    }
  }
  // 5. configure timout
  xhr.timeout = timeout; // in miliseconds
}

function getError() {
  searchResults.innerHTML = 'Connectivity Error';
}



// ***********************
// search params function
//
function params(name) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(name)
}

// ***********************
// check to see if a search has taken place
//
const searchQuery = params('q');
if (searchQuery) {
  // add the query to search input
  searchInput.value = searchQuery;
  searchResults.innerHTML = 'Loading...';
  // run the search
  getJSON('/searchIndex/index.json', search, getError);
  //search(searchIndex, searchQuery);
} else { // no search query
  searchResults.innerHTML = 'Please input your search into the search box above.';
}


// ***********************
// run search
//
function search(data) {
  const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    findAllMatches: true,
    minMatchCharLength: 2,
    // location: 0,
    threshold: 0.4,
    // distance: 100,
    // useExtendedSearch: false,
    ignoreLocation: true,
    // ignoreFieldNorm: false,
    // fieldNormWeight: 1,
    keys: [
      "title", // default weight 1
      {name: "summary", weight: 0.8},
      { name: "content", weight: 0.6 },
      { name: "companies.title", weight: 0.4},
      { name: "species.title", weight: 0.4},
     ]
  };
  // new fuse instance
  const fuse = new Fuse(data, options);
  // search results (object)
  const results = fuse.search(searchQuery);
  showResults(results);
}
// ***********************
// show results
//
function showResults(results) {
  if (!results.length) { // no results
    searchResults.innerHTML = 'No results found';
  } else { // results found
    searchResults.innerHTML = ''; // clear DIV
    results.forEach(element => {
      const {title, image, summary, permalink, content, companies, species} = element.item;
      function taxonomyHTML(taxonomy, titleSingle, titlePlural) {
        let taxonomyHTML = '';
        if (taxonomy.length) { // terms present
          // create an array of term links
          const taxonomyArray = Array.from(taxonomy, value => {
            return `<a href="${value.relPermalink}">${value.title}</a>`;
          })
          // pluralise title
          let taxonomyTitle = titleSingle;
          if (titlePlural && (taxonomyArray.length >= 2)) {
            taxonomyTitle = titlePlural
          }
          // generate HTML
          taxonomyHTML = `
          <div class="pb-1">
            <small>${taxonomyTitle}: ${taxonomyArray.join(', ')}</small>
          </div>`;
        }
        return taxonomyHTML;
      }
      const output = `
      <div class="pb-3">
        <div class="row">
          <div class="col-sm-4 col-md-2">
            <img src="${image}" class="img-fluid">
          </div>
          <div class="col-sm-8 col-md-10">
            <h3 class="mb-1"><a href="${permalink}" class="text-decoration-none">${title}</a></h3>
            <div class="mb-1"><a href="${permalink}" class="link-dark">${permalink}</a></div>
            ${taxonomyHTML(companies, 'Company', 'Companies')}
            ${taxonomyHTML(species,'Species')}
            <div class="lh-1">${summary}</div>
          </div>
        </div>
      </div>`;
      searchResults.innerHTML += output;
    });
  }
}

