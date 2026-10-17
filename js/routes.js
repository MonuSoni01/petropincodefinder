"use strict";

/* =========================================================
   PETRO SALES ROUTE - IMAGE BASED VIEWER

   HOW TO UPDATE:
   1. Upload route image inside:
      images/routes/

   2. Add / update employee object inside routeData

   Example:
   {
       id: "prince-gupta",
       name: "Prince Gupta",
       month: "October 2026",
       image: "images/routes/prince-gupta-oct-2026.png"
   }
========================================================= */


/* =========================================================
   ROUTE DATA
========================================================= */

const routeData = [

    {
        id: "rup-ranjan-bora",
        name: "Rup Ranjan Bora",
        month: "October 2026",
        image: "images/routes/rup-ranjan-oct-2026.png"
    },

    {
        id: "prince-gupta",
        name: "Prince Gupta",
        month: "October 2026",
        image: "images/routes/prince-gupta-oct-2026.png"
    },

    {
        id: "shubham-meena",
        name: "Shubham Meena",
        month: "October 2026",
        image: "images/routes/shubham-oct-2026.png"
    },

    {
        id: "sariya-murtuza",
        name: "Sariya Murtuza",
        month: "October 2026",
        image: ""
    },

    {
        id: "sumanta-kumar",
        name: "Sumanta Kumar",
        month: "October 2026",
        image: ""
    },

    {
        id: "ankit-kalra",
        name: "Ankit Kalra",
        month: "October 2026",
        image: ""
    },

    {
        id: "amit-soni",
        name: "Amit Soni",
        month: "October 2026",
        image: ""
    },

    {
        id: "vivek-srivastava",
        name: "Vivek Srivastava",
        month: "October 2026",
        image: ""
    }

];


/* =========================================================
   ACTIVE FILTER
========================================================= */

let activeRouteFilter = "all";


/* =========================================================
   INITIALIZE PETRO MODULES
========================================================= */

function initPetroModules() {

    const finderTab = document.getElementById("finderTab");
    const routeTab = document.getElementById("routeTab");

    if (finderTab) {

        finderTab.addEventListener("click", function () {

            switchPetroModule("finder");

        });

    }


    if (routeTab) {

        routeTab.addEventListener("click", function () {

            switchPetroModule("route");

        });

    }


    renderRoutePills();

    renderRoutes("all");


    /* Open route tab directly using ?tab=route */

    const requestedTab =
        new URLSearchParams(window.location.search).get("tab");


    if (requestedTab === "route") {

        switchPetroModule("route", false);

    }

}


/* =========================================================
   SWITCH PINCODE / SALES ROUTE MODULE
========================================================= */

function switchPetroModule(moduleName, updateUrl = true) {

    const finderView =
        document.getElementById("pincodeModule");

    const routeView =
        document.getElementById("routeModule");

    const finderTab =
        document.getElementById("finderTab");

    const routeTab =
        document.getElementById("routeTab");


    const isRoute = moduleName === "route";


    if (finderView) {

        finderView.classList.toggle(
            "d-none",
            isRoute
        );

    }


    if (routeView) {

        routeView.classList.toggle(
            "d-none",
            !isRoute
        );

    }


    if (finderTab) {

        finderTab.classList.toggle(
            "active",
            !isRoute
        );

    }


    if (routeTab) {

        routeTab.classList.toggle(
            "active",
            isRoute
        );

    }


    document.title =
        isRoute
            ? "Petro Sales Route"
            : "Petro Pincode Finder";


    /* Update URL */

    if (
        updateUrl &&
        window.history &&
        window.history.replaceState
    ) {

        const url =
            new URL(window.location.href);


        if (isRoute) {

            url.searchParams.set(
                "tab",
                "route"
            );

        }

        else {

            url.searchParams.delete(
                "tab"
            );

        }


        history.replaceState(
            {},
            "",
            url
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   RENDER EMPLOYEE PILLS
========================================================= */

function renderRoutePills() {

    const pills =
        document.getElementById("routePills");


    if (!pills) {

        return;

    }


    const items = [

        {
            id: "all",
            name: "All"
        },

        ...routeData

    ];


    pills.innerHTML =
        items
            .map(function (item) {

                return `

                    <button
                        type="button"

                        class="
                            route-pill
                            ${
                                item.id === activeRouteFilter
                                    ? "active"
                                    : ""
                            }
                        "

                        data-route-filter="
                            ${escapeRouteHtml(item.id)}
                        "
                    >

                        ${escapeRouteHtml(item.name)}

                    </button>

                `;

            })
            .join("");


    pills
        .querySelectorAll(
            "[data-route-filter]"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    activeRouteFilter =
                        this.dataset.routeFilter;


                    renderRoutePills();


                    renderRoutes(
                        activeRouteFilter
                    );

                }
            );

        });

}


/* =========================================================
   RENDER ROUTE CARDS
========================================================= */

function renderRoutes(filterId) {

    const container =
        document.getElementById("routeCards");


    if (!container) {

        return;

    }


    let selected = [];


    if (filterId === "all") {

        selected = routeData;

    }

    else {

        selected =
            routeData.filter(function (item) {

                return item.id === filterId;

            });

    }


    container.innerHTML =
        selected
            .map(createRouteCard)
            .join("");


    /* Add click event to route images */

    container
        .querySelectorAll(
            "[data-route-image]"
        )
        .forEach(function (image) {

            image.addEventListener(
                "click",
                function () {

                    openRouteImage(

                        image.dataset.routeImage,

                        image.alt

                    );

                }
            );

        });

}


/* =========================================================
   CREATE ROUTE CARD
========================================================= */

function createRouteCard(route) {

    const hasImage =
        Boolean(
            route.image &&
            route.image.trim()
        );


    return `

        <article
            class="
                route-card
                ${
                    hasImage
                        ? ""
                        : "route-card-empty"
                }
            "
        >


            <!-- CARD HEADER -->

            <div class="route-card-head">


                <div>


                    <div class="route-person">

                        <i class="fa-solid fa-user"></i>

                        ${escapeRouteHtml(route.name)}

                    </div>


                    <div class="route-month">

                        <i class="fa-regular fa-calendar"></i>

                        ${escapeRouteHtml(route.month)}

                    </div>


                </div>



                ${
                    hasImage

                        ?

                        `

                        <span class="route-status">

                            <i class="fa-solid fa-circle-check"></i>

                            Route Available

                        </span>

                        `

                        :

                        `

                        <span class="route-status pending">

                            <i class="fa-regular fa-image"></i>

                            Image Pending

                        </span>

                        `
                }


            </div>



            <!-- CARD BODY -->

            <div class="route-card-body">


                ${
                    hasImage

                        ?

                        `

                        <button

                            type="button"

                            class="route-image-button"

                            aria-label="
                                Open
                                ${escapeRouteHtml(route.name)}
                                route full screen
                            "

                        >


                            <img

                                src="
                                    ${escapeRouteHtml(route.image)}
                                "

                                alt="
                                    ${escapeRouteHtml(route.name)}
                                    Sales Route -
                                    ${escapeRouteHtml(route.month)}
                                "

                                class="route-image"

                                loading="lazy"

                                data-route-image="
                                    ${escapeRouteHtml(route.image)}
                                "

                            >


                        </button>


                        <p class="route-help">

                            <i class="fa-solid fa-magnifying-glass-plus"></i>

                            Click image to view full screen

                        </p>

                        `

                        :

                        `

                        <div class="route-empty-state">


                            <i class="fa-regular fa-images"></i>


                            <h3>

                                Route image not uploaded yet

                            </h3>


                            <p>

                                Add image inside

                                <strong>
                                    images/routes/
                                </strong>

                                and update

                                <strong>
                                    js/routes.js
                                </strong>

                            </p>


                        </div>

                        `
                }


            </div>


        </article>

    `;

}


/* =========================================================
   OPEN ROUTE IMAGE MODAL
========================================================= */

function openRouteImage(
    src,
    altText
) {

    const modal =
        document.getElementById(
            "routeImageModal"
        );

    const image =
        document.getElementById(
            "routeModalImage"
        );


    if (
        !modal ||
        !image ||
        !src
    ) {

        return;

    }


    image.src = src;

    image.alt =
        altText ||
        "Sales Route";


    /* Reset zoom */

    image.classList.remove(
        "zoomed"
    );


    /* IMPORTANT:
       CSS uses .open
    */

    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "route-modal-open"
    );

}


/* =========================================================
   CLOSE ROUTE IMAGE MODAL
========================================================= */

function closeRouteImage() {

    const modal =
        document.getElementById(
            "routeImageModal"
        );

    const image =
        document.getElementById(
            "routeModalImage"
        );


    if (modal) {

        modal.classList.remove(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (image) {

        image.classList.remove(
            "zoomed"
        );


        image.src = "";

    }


    document.body.classList.remove(
        "route-modal-open"
    );

}


/* =========================================================
   TOGGLE FULLSCREEN IMAGE ZOOM
========================================================= */

function toggleRouteImageZoom() {

    const image =
        document.getElementById(
            "routeModalImage"
        );


    if (!image) {

        return;

    }


    image.classList.toggle(
        "zoomed"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeRouteHtml(value) {

    return String(
        value || ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* Initialize modules */

        initPetroModules();



        /* Get modal elements */

        const closeButton =
            document.getElementById(
                "routeModalClose"
            );

        const modal =
            document.getElementById(
                "routeImageModal"
            );

        const modalImage =
            document.getElementById(
                "routeModalImage"
            );



        /* Close Button */

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    closeRouteImage();

                }
            );

        }



        /* Click image = zoom */

        if (modalImage) {

            modalImage.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    toggleRouteImageZoom();

                }
            );

        }



        /* Click dark background = close */

        if (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        closeRouteImage();

                    }

                }
            );

        }



        /* ESC = Close */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeRouteImage();

                }

            }
        );

    }
);