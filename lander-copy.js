import gsap from "https://cdn.skypack.dev/gsap";
import { CustomEase } from "https://cdn.skypack.dev/gsap/CustomEase";
import SplitType from "https://cdn.skypack.dev/split-type";
import { projectsData } from "./projects";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

document.addEventListener("DOMContentLoaded", () =>{
    const projectsContainer = document.querySelector(".projects");
    const locationContainer = document.querySelector(".locations");
    const gridImages = gsap.utils.toArray(".img");
    const heroImage = document.querySelector(".hero-img");

    const images = gridImages.filter((img) => img != heroImage);

    const introCopy = new SplitType(".intro-copy h3", {
        type: "words",
        absolute: false,
    });

    const titleHeading = new SplitType(".title h1",{
        type: "words",
        absolute: false,
    });

    const allImageSources = Array.from(
        { length: 20 },
        (_,i) => `images/img${i+1}.jpg`
    );

    const getRandomImageSet = () =>{
        const shuffled = [...allImageSources].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 9);
    }

    function initializeDynamicContent(){
        projectsData.forEach((project) =>{
            const projectItem = document.createElement("div");
            projectItem.className = "project-item";

            const projectName = document.createElement("p");
            projectName.textContent = project.name;

            const directorName = document.createElement("p");
            directorName.textContent = project.director;

            projectItem.appendChild(projectName);
            projectItem.appendChild(directorName);

            projectsContainer.appendChild(projectItem);
        });

        projectsData.forEach((project)=>{
            const locationItem = document.createElement("div");
            locationItem.className = "location-item";

            const locationName = document.createElement("p");
            locationName.textContent = project.location;

            locationItem.appendChild(locationName);
            locationContainer.appendChild(locationItem);
        });
    }

    function startImageRotation(){
        const totalCycles = 20;

        for (let cycle = 0; cycle < totalCycles; cycle++){
            const randomImages = getRandomImageSet();

            gsap.to({},{
                duration: 0,
                delay: cycle*0.15,
                onComplete: () => {
                    gridImages.forEach((img,index)=>{
                        const imgElement = img.querySelector("img");

                        if (cycle == totalCycles -1 && img == heroImage){
                            imgElement.src="images/img2.jpg";
                            gsap.set(".hero-img img", {scale: 2});
                        } else{
                            imgElement.src = randomImages[index];
                        }
                    })
                }
            })
        }
    }

    function setupInitialStates(){
        gsap.set("nav",{
            y: "-125%",
        });

        gsap.set(introCopy.words, {
            y: "100%",
        });

        gsap.set(titleHeading.words, {
            y: "100%",
        });
    }

    function init(){
        initializeDynamicContent();
        setupInitialStates();
        createAnimationTimelines();
    }

    init();

    function createAnimationTimelines(){
        const overlayTimeline = gsap.timeline();
        const imagesTimeline = gsap.timeline();
        const textTimeline = gsap.timeline();

        overlayTimeline.to(".logo-line-1",{
            backgroundPosition: "0% 0%",
            color: "#fff",
            duration: 1,
            ease: "none",
            delay: 0.5,
        });

        overlayTimeline.to([".projects-header", ".project-item"],{
            opacity: 1,
            duration: 0.15,
            stagger: 0.075,
            delay: 1,
        });

        overlayTimeline.to(
            [".locations-header", ".location-item"],
            {
                opacity:1,
                duration: 0.15,
                stagger: 0.075,
            },
            "<"
        );

        overlayTimeline.to(".project-item",{
            color: "#fff",
            duration: 0.15,
            stagger: 0.075,
        });

        overlayTimeline.to(
            ".location-item",
            {
                color: "#fff",
                duration: 0.15,
                stagger: 0.075,
            },
            "<"
        );

        overlayTimeline.to([".projects-header", ".project-item"],{
            opacity: 0,
            duration: 0.15,
            stagger: 0.075,
        });

        overlayTimeline.to(
            [".locations-header", ".location-item"],
            {
                opacity: 0,
                duration: 0.15,
                stagger: 0.075,
            },
            "<"
        );

        overlayTimeline.to(".overlay", {
            opacity: 0,
            duration: 0.5,
            delay: 1.5,
        });

        imagesTimeline.to(".img", {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1,
            delay: 2.5,
            stagger: 0.05,
            ease: "hop",
            onStart:() => {
                setTimeout(()=>{
                    startImageRotation();
                    gsap.to(".loader", {opacity: 0, duration: 0.3});
                },1000);
            }
        });

        imagesTimeline.to(images, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            delay: 2.5,
            stagger: 0.05,
            ease: "hop",
        });

        // After non-hero images collapse, hero grows smoothly from its grid position
        // — never collapses, so it appears to stay in place then expand
        imagesTimeline.to(".hero-img", {
            scale: 4,
            clipPath: "polygon(20% 10%, 80% 10%, 80% 90%, 20% 90%)",
            duration: 1.5,
            ease: "hop",
            onStart: () => {
                gsap.to(".hero-img img", {
                    scale: 1,
                    duration: 1.5,
                    ease: "hop",
                });

                gsap.to("nav", { y: "0%", duration: 1, ease: "hop", delay: 0.25 });

                textTimeline.to(titleHeading.words, {
                    y: "0%",
                    duration: 1,
                    stagger: 0.1,
                    delay: 1.5,
                    ease: "power3.out",
                });

                textTimeline.to(
                    introCopy.words, {
                        y: "0%",
                        duration: 1,
                        stagger: 0.1,
                        delay: 0.25,
                        ease: "power3.out",
                    },
                    "<"
                );
            }
        });

        // Hero shifts left by exactly half the panel width so the gap between
        // hero right-edge and panel left-edge is centred on the page.
        // Hero visible width at scale 4 ≈ 60% of its container (clip is 20-80% = 60%)
        // Container is 30vw  →  visible hero ≈ 18vw
        // Reveal panel is 36vw wide
        // Total composed width ≈ 18vw + 36vw = 54vw
        // To centre: left edge of hero at 50% - 27vw = 23vw
        // Hero centre currently at 50%, so shift = -(27vw - 9vw) = -18vw
        imagesTimeline.to(".hero-img", {
            x: "-15vw",
            duration: 1.5,
            ease: "hop",
            delay: 0.5,
            onStart: () => {
                gsap.set(".reveal-panel", { opacity: 1 });

                gsap.to(".reveal-panel-text", {
                    x: "35%",
                    duration: 1.5,
                    ease: "hop",
                });
            }
        });
    }
});