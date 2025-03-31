// Invoking function when the content is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // Fetching information to be showed in website
  const json_file = await fetch("./content.json");
  const decoded = await json_file.json();

  // Determining the language of the browser in order to display the correct text
  const inSpanish = navigator.language.match("es-*") != null ? true : false;
  const content = inSpanish ? decoded.ES : decoded.EN;

  // Set page information according to language of browser
  createInformation(content, inSpanish);

  handleLanguagesClass($languages);

  // Set typewritter effect on hero section
  let $typeName = document.querySelector(".name");

  setTimeout(() => typewritterEffect($typeName, content.name, 0), 2000);

  // Class mutation observer
  watcher($languages);

  handleViewTransition();
});

const $languages = document.querySelectorAll(".languages_nav button");

let mutationConfig = { attributes: true };
let languages = ["javascript", "typescript", "css", "nodejs", "react"];

function mutationCallback(mutationList = [], observer) {
  // Change projects previews visibility in DOM
  let $projects = document.querySelectorAll(".preview");

  for (const mutation of mutationList) {
    if (mutation.type == "attributes" && mutation.attributeName == "class") {
      if ($projects == undefined) return;

      $projects.forEach((preview) => {
        let project_stack = preview.getAttribute("data-stack").split(" ");
        let includesStack = false;
        let techStack = mutation.target.getAttribute("data-tech");

        let indexLang = languages.indexOf(techStack);

        if (mutation.target.classList.contains("unselected")) {
          // Deleting language from array to filter elements in the DOM
          if (indexLang != -1) languages.splice(indexLang, 1);

          for (const el of project_stack) {
            for (const lang of languages) {
              includesStack = el === lang;

              if (includesStack) break;
            }

            if (includesStack) break;
          }

          if (!includesStack) {
            if (document.startViewTransition === undefined) {
              preview.classList.add("not_visible");
            } else {
              document.startViewTransition(() => {
                preview.classList.add("not_visible");
              });
            }
          }
        } else {
          // Add language to filter
          if (!languages.includes(mutation.target.getAttribute("data-tech")))
            languages.push(mutation.target.getAttribute("data-tech"));

          for (const el of project_stack) {
            for (const lang of languages) {
              includesStack = el === lang;

              if (includesStack) break;
            }

            if (includesStack) break;
          }

          if (includesStack) {
            if (document.startViewTransition === undefined)
              preview.classList.remove("not_visible");
            else {
              document.startViewTransition(() =>
                preview.classList.remove("not_visible"),
              );
            }
          }
        }
      });
    }
  }
}

// Add class mutation observer to languages logos
function watcher(languages) {
  languages.forEach((lang) => {
    let classWatcher = new MutationObserver(mutationCallback);

    classWatcher.observe(lang, mutationConfig);
  });
}

function handleLanguagesClass(arrLang) {
  // Remove filter and add animation of logos on click
  arrLang.forEach((element) => {
    element.addEventListener("click", () => {
      element.classList.toggle("unselected");
    });
  });
}

// Get string of the properties on the json content file and create the DOM elements
function createInformation(json, inSpanish) {
  const $cover_letter = document.querySelector(".cover_letter");
  const $greeting = document.querySelector(".greeting");
  const $projectsSectionTitle = document.querySelector(".projects h2");
  const $contact = document.querySelector(".contact_description");
  const $resume = document.querySelector(".resume");
  const $sourceCode = document.querySelector(".source_code");

  const $projects_previews = document.querySelector(".projects_preview");
  const template = document.getElementById("project_template");

  if ($projects_previews != undefined && template != undefined) {
    const projects = json.projects;

    for (const key in projects) {
      if (projects.hasOwnProperty(key)) {
        const element = projects[key];

        const domClone = template.content.cloneNode(true);

        let $li = domClone.querySelector("li");
        $li.setAttribute("data-stack", element.stack);

        let $a = domClone.querySelector("a");
        $a.setAttribute("href", element.live_demo);
        $a.setAttribute("alt", `Project ${element.title}`);

        let $img = domClone.querySelector("img");
        $img.setAttribute("src", element.preview);

        let $h4 = domClone.querySelector(".project_info h4");
        $h4.textContent = element.title;

        let $p = domClone.querySelector(".project_info p");
        $p.textContent = element.description;

        $projects_previews.append(domClone);
      }
    }
  }

  if ($cover_letter != undefined) $cover_letter.textContent = json.coverLetter;
  if ($greeting != undefined) $greeting.textContent = json.greeting;
  if ($projectsSectionTitle != undefined)
    $projectsSectionTitle.textContent = inSpanish ? "Projectos" : "Projects";
  if ($contact != undefined) $contact.textContent = json.contact;
  if ($sourceCode != undefined)
    $sourceCode.textContent = inSpanish
      ? "Ver código fuente"
      : "View source code";
  if ($resume != undefined) {
    $resume.textContent = inSpanish
      ? "Descargar currículum"
      : "Download resume";

    $resume.setAttribute("href", json.resume);
  }
}

// Function to get random DOM position relative to elements current position
function getRandomPosition(x = 0, y = 0, length = 1) {
  const position = {
    x: x,
    y: y,
  };

  position.x = (window.innerWidth - x) / length + 1;

  position.x = Math.floor(position.x * Math.random());

  position.y = window.innerHeight - y / 4;
  position.y = Math.floor(position.y * Math.random());

  return position;
}

/**
 * @function
 *@param {HTMLDivElement} divElement
 *@param {string} text
 *@param {number} [letter=0]
 *
 * */
function typewritterEffect(div, text, letter = 0) {
  if (letter === 0 && div !== null) div.textContent = "";

  if (letter === text.length || div === null) return;

  div.textContent += text[letter];

  setTimeout(
    () => typewritterEffect(div, text, letter + 1),
    90 + 20 * Math.random(),
  );
}

/**
 *
 * @function
 *@param {void}
 * */

function handleViewTransition() {
  try {
    if (navigation) {
      navigation.addEventListener("navigate", async (e) => {
        if (!e.destination.url.includes(document.location.origin)) return;

        e.intercept({
          handler: async () => {
            const request = await fetch(e.destination.url);
            const responseTxt = await request.text();

            const transition = document.startViewTransition(() => {
              const body = responseTxt.match(
                /<body[^>]*>([\s\S]*)<\/body>/i,
              )[1];

              document.body.innerHTML = body;

              const title = responseTxt.match(/<title[^>]*>(.*?)<\/title>/i)[1];

              document.title = title;
            });

            transition.ready
              .then(async () => {
                // Fetching information to be showed in website
                const json_file = await fetch("./content.json");
                const decoded = await json_file.json();

                // Determining the language of the browser in order to display the correct text
                const inSpanish =
                  navigator.language.match("es-*") != null ? true : false;
                const content = inSpanish ? decoded.ES : decoded.EN;

                // Set page information according to language of browser
                createInformation(content, inSpanish);

                // Set typewritter effect on hero section
                let $typeName = document.querySelector(".name");

                setTimeout(
                  () => typewritterEffect($typeName, content.name, 0),
                  2000,
                );

                window.scrollTo(0, 0);
              })
              .finally(() => {
                languages = [
                  "javascript",
                  "typescript",
                  "css",
                  "nodejs",
                  "react",
                ];
                let $projects = document.querySelectorAll(".preview");

                const $newLangArr = document.querySelectorAll(
                  ".languages_nav button",
                );

                $projects.forEach((el) => {
                  if (el.classList.contains("not_visible")) {
                    el.classList.remove("not_visible");
                  }
                });

                handleLanguagesClass($newLangArr);
                // Class mutation observer

                watcher($newLangArr);
              });
          },
          scroll: "manual",
        });
      });
    }
  } catch (error) {
    console.info("Browser does not support ViewTransition API");
  }
}
