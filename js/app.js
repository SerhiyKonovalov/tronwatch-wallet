(() => {
    "use strict";
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    class TronWatchApp {
        constructor() {
            this.init();
        }
        init() {
            this.setupNavigation();
            this.setupScrollEffects();
            this.setupAnimations();
            this.setupFormValidation();
            this.initializePageSpecificFeatures();
        }
        initializePageSpecificFeatures() {
            const currentPage = window.location.pathname.split("/").pop() || "index.html";
            switch (currentPage) {
              case "help-center.html":
                this.initializeHelpCenter();
                break;

              case "documentation.html":
                this.initializeDocumentation();
                break;

              default:
                break;
            }
        }
        setupNavigation() {
            const navToggle = document.getElementById("navToggle");
            const navMenu = document.getElementById("navMenu");
            if (navToggle && navMenu) {
                navToggle.addEventListener("click", (() => {
                    navMenu.classList.toggle("nav__menu--active");
                    this.toggleNavIcon(navToggle);
                }));
                const navLinks = navMenu.querySelectorAll(".nav__link");
                navLinks.forEach((link => {
                    link.addEventListener("click", (() => {
                        navMenu.classList.remove("nav__menu--active");
                        this.resetNavIcon(navToggle);
                    }));
                }));
                document.addEventListener("click", (e => {
                    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                        navMenu.classList.remove("nav__menu--active");
                        this.resetNavIcon(navToggle);
                    }
                }));
            }
            this.setActiveNavLink();
        }
        toggleNavIcon(toggle) {
            const spans = toggle.querySelectorAll("span");
            const isActive = toggle.classList.contains("nav__toggle--active");
            if (!isActive) {
                spans[0].style.transform = "translateY(6px) rotate(45deg)";
                spans[1].style.opacity = "0";
                spans[2].style.transform = "translateY(-6px) rotate(-45deg)";
                toggle.classList.add("nav__toggle--active");
            } else {
                spans[0].style.transform = "translateY(0) rotate(0)";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "translateY(0) rotate(0)";
                toggle.classList.remove("nav__toggle--active");
            }
        }
        resetNavIcon(toggle) {
            const spans = toggle.querySelectorAll("span");
            spans.forEach((span => {
                span.style.transform = "translateY(0) rotate(0)";
                span.style.opacity = "1";
            }));
            toggle.classList.remove("nav__toggle--active");
        }
        setActiveNavLink() {
            const currentPage = window.location.pathname.split("/").pop() || "index.html";
            const navLinks = document.querySelectorAll(".nav__link");
            navLinks.forEach((link => {
                link.classList.remove("nav__link--active");
                const href = link.getAttribute("href");
                if (href === currentPage || currentPage === "" && href === "index.html") link.classList.add("nav__link--active");
            }));
        }
        setupScrollEffects() {
            const header = document.querySelector(".header");
            let lastScrollTop = 0;
            window.addEventListener("scroll", (() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop > 50) header.style.backgroundColor = "rgba(10, 10, 10, 0.98)"; else header.style.backgroundColor = "rgba(10, 10, 10, 0.95)";
                lastScrollTop = scrollTop;
            }));
            const anchorLinks = document.querySelectorAll('a[href^="#"]');
            anchorLinks.forEach((link => {
                link.addEventListener("click", (e => {
                    e.preventDefault();
                    const targetId = link.getAttribute("href").substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        const headerHeight = header.offsetHeight;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: "smooth"
                        });
                    }
                }));
            }));
        }
        setupAnimations() {
            const buttons = document.querySelectorAll(".btn");
            buttons.forEach((button => {
                button.addEventListener("mouseenter", (e => {
                    if (button.classList.contains("btn--primary")) {
                        const ripple = document.createElement("span");
                        ripple.className = "ripple";
                        button.appendChild(ripple);
                        setTimeout((() => {
                            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
                        }), 600);
                    }
                }));
            }));
            if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname === "") this.animateStatsCounters();
        }
        animateStatsCounters() {
            const statsValues = document.querySelectorAll(".stats__value, .blockchain-metric__value, .ecosystem-stat__value, .dev-stat__number");
            const observer = new IntersectionObserver((entries => {
                entries.forEach((entry => {
                    if (entry.isIntersecting) {
                        this.countUp(entry.target);
                        observer.unobserve(entry.target);
                    }
                }));
            }));
            statsValues.forEach((stat => observer.observe(stat)));
        }
        countUp(element) {
            const target = element.getAttribute("data-target");
            const text = element.textContent;
            if (!target) {
                if (text === "99.9%") this.animateNumber(element, 99.9, "%"); else if (text === "24/7") this.animateNumber(element, 24, "/7"); else if (text.includes("%")) {
                    const number = parseFloat(text.replace("%", ""));
                    this.animateNumber(element, number, "%");
                } else if (text.includes("/")) {
                    const parts = text.split("/");
                    const number = parseFloat(parts[0]);
                    this.animateNumber(element, number, "/" + parts[1]);
                } else {
                    const number = parseFloat(text.replace(/[^\d.]/g, ""));
                    const suffix = text.replace(/[\d.]/g, "");
                    this.animateNumber(element, number, suffix);
                }
                return;
            }
            const targetNumber = parseFloat(target);
            const prefix = element.getAttribute("data-prefix") || "";
            const suffix = element.getAttribute("data-suffix") || "";
            const duration = 2e3;
            const steps = 60;
            const increment = targetNumber / steps;
            let current = 0;
            let step = 0;
            const timer = setInterval((() => {
                current += increment;
                step++;
                if (step >= steps) {
                    current = targetNumber;
                    clearInterval(timer);
                }
                if (suffix === "M+") element.textContent = (current / 1e6).toFixed(1) + suffix; else if (suffix === "B") element.textContent = prefix + current.toFixed(1) + suffix; else element.textContent = prefix + current.toFixed(0) + suffix;
            }), duration / steps);
        }
        animateNumber(element, number, suffix) {
            const duration = 2e3;
            const steps = 60;
            const increment = number / steps;
            let current = 0;
            let step = 0;
            const timer = setInterval((() => {
                current += increment;
                step++;
                if (step >= steps) {
                    current = number;
                    clearInterval(timer);
                }
                if (suffix.includes("M")) element.textContent = (current / 1e6).toFixed(1) + "M+"; else if (suffix.includes("B")) element.textContent = "$" + (current / 1e9).toFixed(1) + "B"; else if (suffix.includes("%")) element.textContent = current.toFixed(1) + "%"; else if (suffix.includes("$")) element.textContent = "$" + current.toFixed(3); else if (suffix.includes("+")) element.textContent = current.toFixed(0) + "+"; else if (suffix === "%") element.textContent = current.toFixed(1) + "%"; else if (suffix === "/7") element.textContent = Math.round(current) + "/7"; else element.textContent = current.toFixed(0) + suffix;
            }), duration / steps);
        }
        setupFormValidation() {
            const forms = document.querySelectorAll("form");
            forms.forEach((form => {
                form.addEventListener("submit", (e => {
                    if (!this.validateForm(form)) e.preventDefault();
                }));
                const inputs = form.querySelectorAll("input, textarea, select");
                inputs.forEach((input => {
                    input.addEventListener("blur", (() => {
                        this.validateField(input);
                    }));
                    input.addEventListener("input", (() => {
                        this.clearFieldError(input);
                    }));
                }));
            }));
        }
        validateForm(form) {
            let isValid = true;
            const inputs = form.querySelectorAll("input[required], textarea[required], select[required]");
            inputs.forEach((input => {
                if (!this.validateField(input)) isValid = false;
            }));
            return isValid;
        }
        validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = "";
            this.clearFieldError(field);
            if (field.hasAttribute("required") && !value) {
                errorMessage = "This field is required";
                isValid = false;
            }
            if (field.type === "email" && value && !this.isValidEmail(value)) {
                errorMessage = "Please enter a valid email address";
                isValid = false;
            }
            if (!isValid) this.showFieldError(field, errorMessage);
            return isValid;
        }
        showFieldError(field, message) {
            field.classList.add("form__input--error");
            const errorElement = document.createElement("div");
            errorElement.className = "form__error";
            errorElement.textContent = message;
            field.parentNode.appendChild(errorElement);
        }
        clearFieldError(field) {
            field.classList.remove("form__input--error");
            const existingError = field.parentNode.querySelector(".form__error");
            if (existingError) existingError.remove();
        }
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        initializeHelpCenter() {
            this.setupFAQFunctionality();
            this.setupContactForm();
            this.setupSearchFunctionality();
        }
        setupFAQFunctionality() {
            const categories = document.querySelectorAll(".faq__category");
            const sections = document.querySelectorAll(".faq__section");
            categories.forEach((category => {
                category.addEventListener("click", (() => {
                    const targetCategory = category.getAttribute("data-category");
                    categories.forEach((cat => cat.classList.remove("faq__category--active")));
                    sections.forEach((section => section.classList.remove("faq__section--active")));
                    category.classList.add("faq__category--active");
                    const targetSection = document.getElementById(targetCategory);
                    if (targetSection) targetSection.classList.add("faq__section--active");
                    this.closeAllFAQItems();
                }));
            }));
            this.setupFAQItems();
        }
        setupFAQItems() {
            const faqItems = document.querySelectorAll(".faq-item");
            faqItems.forEach((item => {
                const question = item.querySelector(".faq-item__question");
                const answer = item.querySelector(".faq-item__answer");
                question.addEventListener("click", (() => {
                    const isActive = item.classList.contains("faq-item--active");
                    const currentSection = item.closest(".faq__section");
                    if (currentSection) {
                        const sectionItems = currentSection.querySelectorAll(".faq-item");
                        sectionItems.forEach((otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove("faq-item--active");
                                const otherAnswer = otherItem.querySelector(".faq-item__answer");
                                if (otherAnswer) {
                                    otherAnswer.style.maxHeight = "0";
                                    otherAnswer.style.padding = "0 var(--spacing-lg)";
                                }
                            }
                        }));
                    }
                    if (!isActive) {
                        item.classList.add("faq-item--active");
                        if (answer) {
                            answer.style.maxHeight = answer.scrollHeight + 40 + "px";
                            answer.style.paddingTop = "var(--spacing-lg)";
                            answer.style.paddingBottom = "var(--spacing-lg)";
                            answer.style.paddingLeft = "var(--spacing-lg)";
                            answer.style.paddingRight = "var(--spacing-lg)";
                        }
                    } else {
                        item.classList.remove("faq-item--active");
                        if (answer) {
                            answer.style.maxHeight = "0";
                            answer.style.paddingTop = "0";
                            answer.style.paddingBottom = "0";
                            answer.style.paddingLeft = "var(--spacing-lg)";
                            answer.style.paddingRight = "var(--spacing-lg)";
                        }
                    }
                }));
            }));
        }
        closeAllFAQItems() {
            const faqItems = document.querySelectorAll(".faq-item");
            faqItems.forEach((item => {
                item.classList.remove("faq-item--active");
                const answer = item.querySelector(".faq-item__answer");
                if (answer) {
                    answer.style.maxHeight = "0";
                    answer.style.paddingTop = "0";
                    answer.style.paddingBottom = "0";
                    answer.style.paddingLeft = "var(--spacing-lg)";
                    answer.style.paddingRight = "var(--spacing-lg)";
                }
            }));
        }
        setupSearchFunctionality() {
            const searchInput = document.querySelector(".search-box__input");
            const searchButton = document.querySelector(".search-box__button");
            if (searchInput) {
                searchInput.addEventListener("input", this.debounce((e => {
                    this.searchFAQ(e.target.value.toLowerCase());
                }), 300));
                searchInput.addEventListener("keypress", (e => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        this.searchFAQ(searchInput.value.toLowerCase());
                    }
                }));
            }
            if (searchButton) searchButton.addEventListener("click", (() => {
                this.searchFAQ(searchInput.value.toLowerCase());
            }));
        }
        searchFAQ(searchTerm) {
            const faqItems = document.querySelectorAll(".faq-item");
            const sections = document.querySelectorAll(".faq__section");
            let foundResults = false;
            if (!searchTerm) {
                faqItems.forEach((item => {
                    item.style.display = "block";
                    this.clearHighlights(item);
                }));
                return;
            }
            sections.forEach((section => {
                const sectionItems = section.querySelectorAll(".faq-item");
                let sectionHasResults = false;
                sectionItems.forEach((item => {
                    const question = item.querySelector(".faq-item__question h3").textContent.toLowerCase();
                    const answer = item.querySelector(".faq-item__answer p").textContent.toLowerCase();
                    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                        item.style.display = "block";
                        this.highlightSearchTerm(item, searchTerm);
                        sectionHasResults = true;
                        foundResults = true;
                    } else {
                        item.style.display = "none";
                        this.clearHighlights(item);
                    }
                }));
                if (sectionHasResults) {
                    section.classList.add("faq__section--active");
                    const categoryButton = document.querySelector(`[data-category="${section.id}"]`);
                    if (categoryButton) {
                        document.querySelectorAll(".faq__category").forEach((cat => cat.classList.remove("faq__category--active")));
                        categoryButton.classList.add("faq__category--active");
                    }
                }
            }));
            this.toggleNoResultsMessage(!foundResults, searchTerm);
        }
        highlightSearchTerm(element, term) {
            this.clearHighlights(element);
            const textElements = element.querySelectorAll(".faq-item__question h3, .faq-item__answer p");
            textElements.forEach((textElement => {
                const text = textElement.textContent;
                const regex = new RegExp(`(${this.escapeRegExp(term)})`, "gi");
                const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
                textElement.innerHTML = highlightedText;
            }));
        }
        clearHighlights(element) {
            const highlights = element.querySelectorAll(".search-highlight");
            highlights.forEach((highlight => {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize();
            }));
        }
        toggleNoResultsMessage(show, searchTerm) {
            let noResultsElement = document.querySelector(".no-results-message");
            if (show && !noResultsElement) {
                noResultsElement = document.createElement("div");
                noResultsElement.className = "no-results-message";
                noResultsElement.innerHTML = `\n                <div class="no-results-content">\n                    <h3>No results found for "${searchTerm}"</h3>\n                    <p>Try adjusting your search terms or browse our FAQ categories.</p>\n                    <button class="btn btn--secondary" onclick="this.parentElement.parentElement.remove(); document.querySelector('.search-box__input').value = ''; window.tronWatchApp.searchFAQ('');">\n                        Clear Search\n                    </button>\n                </div>\n            `;
                const faqContent = document.querySelector(".faq__content");
                faqContent.appendChild(noResultsElement);
            } else if (!show && noResultsElement) noResultsElement.remove();
        }
        setupContactForm() {
            const contactForm = document.getElementById("contactForm");
            if (contactForm) {
                contactForm.addEventListener("submit", (e => {
                    e.preventDefault();
                    if (this.validateContactForm(contactForm)) this.submitContactForm(contactForm);
                }));
                const fields = contactForm.querySelectorAll("input, select, textarea");
                fields.forEach((field => {
                    field.addEventListener("blur", (() => {
                        this.validateContactField(field);
                    }));
                    field.addEventListener("input", (() => {
                        this.clearFieldError(field);
                    }));
                }));
            }
        }
        validateContactForm(form) {
            let isValid = true;
            const requiredFields = [ "name", "email", "category", "subject", "message" ];
            requiredFields.forEach((fieldName => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (!this.validateContactField(field)) isValid = false;
            }));
            const checkbox = form.querySelector('input[type="checkbox"]');
            if (!checkbox.checked) {
                this.showFieldError(checkbox.parentElement, "You must agree to the terms");
                isValid = false;
            }
            return isValid;
        }
        validateContactField(field) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = "";
            this.clearFieldError(field);
            if (field.hasAttribute("required") && !value) {
                errorMessage = "This field is required";
                isValid = false;
            }
            if (field.type === "email" && value && !this.isValidEmail(value)) {
                errorMessage = "Please enter a valid email address";
                isValid = false;
            }
            if (field.name === "name" && value && value.length < 2) {
                errorMessage = "Name must be at least 2 characters long";
                isValid = false;
            }
            if (field.name === "subject" && value && value.length < 5) {
                errorMessage = "Subject must be at least 5 characters long";
                isValid = false;
            }
            if (field.name === "message" && value && value.length < 10) {
                errorMessage = "Message must be at least 10 characters long";
                isValid = false;
            }
            if (!isValid) this.showFieldError(field, errorMessage);
            return isValid;
        }
        async submitContactForm(form) {
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = "Sending...";
            submitButton.disabled = true;
            try {
                await this.simulateFormSubmission(new FormData(form));
                this.showFormSuccess();
                form.reset();
            } catch (error) {
                console.error("Form submission error:", error);
                this.showFormError("There was an error sending your message. Please try again.");
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }
        simulateFormSubmission(formData) {
            return new Promise((resolve => {
                setTimeout((() => {
                    console.log("Form data:", Object.fromEntries(formData));
                    resolve();
                }), 1500);
            }));
        }
        showFormSuccess() {
            const existingSuccess = document.querySelector(".form-success-overlay");
            if (existingSuccess) existingSuccess.remove();
            const successOverlay = document.createElement("div");
            successOverlay.className = "form-success-overlay";
            successOverlay.innerHTML = `\n            <div class="form-success-message">\n                <div class="success-content">\n                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">\n                        <circle cx="24" cy="24" r="20" fill="var(--color-success)"/>\n                        <path d="M16 24L20 28L32 16" stroke="white" stroke-width="3" stroke-linecap="round"/>\n                    </svg>\n                    <h3>Message Sent Successfully!</h3>\n                    <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>\n                    <button class="btn btn--secondary" onclick="this.closest('.form-success-overlay').remove()">Close</button>\n                </div>\n            </div>\n        `;
            document.body.appendChild(successOverlay);
            setTimeout((() => {
                if (successOverlay.parentElement) successOverlay.remove();
            }), 1e4);
        }
        showFormError(message) {
            const errorElement = document.createElement("div");
            errorElement.className = "form-error-message";
            errorElement.textContent = message;
            const contactForm = document.getElementById("contactForm");
            contactForm.parentElement.insertBefore(errorElement, contactForm);
            setTimeout((() => {
                errorElement.remove();
            }), 5e3);
        }
        initializeDocumentation() {
            this.setupDocumentationNavigation();
            this.setupDocSearchFunctionality();
            this.setupCodeCopyButtons();
        }
        setupDocumentationNavigation() {
            const navItems = document.querySelectorAll(".doc-nav__item");
            const sections = document.querySelectorAll(".doc-section");
            navItems.forEach((item => {
                item.addEventListener("click", (() => {
                    const targetSection = item.getAttribute("data-section");
                    navItems.forEach((navItem => navItem.classList.remove("doc-nav__item--active")));
                    sections.forEach((section => section.classList.remove("doc-section--active")));
                    item.classList.add("doc-nav__item--active");
                    const targetElement = document.getElementById(targetSection);
                    if (targetElement) targetElement.classList.add("doc-section--active");
                    if (history.replaceState) history.replaceState(null, null, `#${targetSection}`);
                }));
            }));
            this.handleInitialHash();
            window.addEventListener("hashchange", (() => {
                this.handleInitialHash();
            }));
        }
        handleInitialHash() {
            const hash = window.location.hash.substring(1);
            if (hash) {
                const navItem = document.querySelector(`[data-section="${hash}"]`);
                if (navItem) {
                    const targetSection = navItem.getAttribute("data-section");
                    document.querySelectorAll(".doc-nav__item").forEach((item => item.classList.remove("doc-nav__item--active")));
                    document.querySelectorAll(".doc-section").forEach((section => section.classList.remove("doc-section--active")));
                    navItem.classList.add("doc-nav__item--active");
                    const targetElement = document.getElementById(targetSection);
                    if (targetElement) targetElement.classList.add("doc-section--active");
                }
            }
        }
        setupDocSearchFunctionality() {
            const searchInput = document.querySelector(".search-box__input");
            const sections = document.querySelectorAll(".doc-section");
            if (searchInput) searchInput.addEventListener("input", this.debounce((e => {
                const searchTerm = e.target.value.toLowerCase();
                this.searchDocumentation(searchTerm, sections);
            }), 300));
        }
        searchDocumentation(searchTerm, sections) {
            if (!searchTerm) {
                sections.forEach((section => {
                    const articles = section.querySelectorAll(".doc-article");
                    articles.forEach((article => {
                        article.style.display = "block";
                        this.clearHighlights(article);
                    }));
                }));
                return;
            }
            sections.forEach((section => {
                const articles = section.querySelectorAll(".doc-article");
                let sectionHasResults = false;
                articles.forEach((article => {
                    const text = article.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        article.style.display = "block";
                        this.highlightSearchTermInDoc(article, searchTerm);
                        sectionHasResults = true;
                    } else {
                        article.style.display = "none";
                        this.clearHighlights(article);
                    }
                }));
                if (sectionHasResults && section.classList.contains("doc-section--active")) ;
            }));
        }
        highlightSearchTermInDoc(element, term) {
            this.clearHighlights(element);
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) if (node.textContent.toLowerCase().includes(term)) textNodes.push(node);
            textNodes.forEach((textNode => {
                const parent = textNode.parentNode;
                const text = textNode.textContent;
                const regex = new RegExp(`(${this.escapeRegExp(term)})`, "gi");
                const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
                const wrapper = document.createElement("div");
                wrapper.innerHTML = highlightedText;
                while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, textNode);
                parent.removeChild(textNode);
            }));
        }
        setupCodeCopyButtons() {
            const codeBlocks = document.querySelectorAll(".code-block");
            codeBlocks.forEach((block => {
                if (block.querySelector(".code-copy-btn")) return;
                const copyButton = document.createElement("button");
                copyButton.className = "code-copy-btn";
                copyButton.innerHTML = `\n                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">\n                    <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" fill="none"/>\n                    <rect x="6" y="6" width="8" height="8" rx="1" stroke="currentColor" fill="none"/>\n                </svg>\n                Copy\n            `;
                copyButton.addEventListener("click", (() => {
                    const preElement = block.querySelector("pre");
                    if (!preElement) return;
                    const code = preElement.textContent;
                    this.copyToClipboard(code, copyButton);
                }));
                block.style.position = "relative";
                block.appendChild(copyButton);
            }));
            const apiEndpoints = document.querySelectorAll(".api-endpoint");
            apiEndpoints.forEach((endpoint => {
                if (endpoint.querySelector(".code-copy-btn")) return;
                const pathElement = endpoint.querySelector(".api-endpoint__path");
                if (!pathElement) return;
                const copyButton = document.createElement("button");
                copyButton.className = "code-copy-btn code-copy-btn--small";
                copyButton.innerHTML = `\n                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">\n                    <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" fill="none"/>\n                    <rect x="6" y="6" width="8" height="8" rx="1" stroke="currentColor" fill="none"/>\n                </svg>\n            `;
                copyButton.addEventListener("click", (() => {
                    const code = pathElement.textContent;
                    this.copyToClipboard(code, copyButton);
                }));
                endpoint.style.position = "relative";
                endpoint.appendChild(copyButton);
            }));
            const codeExamples = document.querySelectorAll(".code-example");
            codeExamples.forEach((example => {
                if (example.querySelector(".code-copy-btn")) return;
                const preElement = example.querySelector("pre");
                if (!preElement) return;
                const copyButton = document.createElement("button");
                copyButton.className = "code-copy-btn";
                copyButton.innerHTML = `\n                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">\n                    <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" fill="none"/>\n                    <rect x="6" y="6" width="8" height="8" rx="1" stroke="currentColor" fill="none"/>\n                </svg>\n                Copy\n            `;
                copyButton.addEventListener("click", (() => {
                    const code = preElement.textContent;
                    this.copyToClipboard(code, copyButton);
                }));
                example.style.position = "relative";
                example.appendChild(copyButton);
            }));
        }
        async copyToClipboard(text, button) {
            try {
                if (!navigator.clipboard) {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                } else await navigator.clipboard.writeText(text);
                const originalContent = button.innerHTML;
                button.innerHTML = `\n                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">\n                    <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" fill="none"/>\n                </svg>\n                Copied!\n            `;
                button.classList.add("code-copy-btn--success");
                setTimeout((() => {
                    button.innerHTML = originalContent;
                    button.classList.remove("code-copy-btn--success");
                }), 2e3);
            } catch (err) {
                console.error("Failed to copy text: ", err);
                const originalContent = button.innerHTML;
                button.innerHTML = `\n                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">\n                    <path d="M8 1L15 15H1L8 1Z" stroke="currentColor" stroke-width="2" fill="none"/>\n                    <path d="M8 6V10" stroke="currentColor" stroke-width="2"/>\n                    <circle cx="8" cy="13" r="1" fill="currentColor"/>\n                </svg>\n                Error\n            `;
                button.classList.add("code-copy-btn--error");
                setTimeout((() => {
                    button.innerHTML = originalContent;
                    button.classList.remove("code-copy-btn--error");
                }), 2e3);
            }
        }
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout((() => inThrottle = false), limit);
                }
            };
        }
        escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
    }
    const additionalCSS = `\n    .form__input--error {\n        border-color: var(--color-error) !important;\n    }\n    \n    .form__error {\n        color: var(--color-error);\n        font-size: var(--font-size-sm);\n        margin-top: var(--spacing-xs);\n    }\n    \n    .ripple {\n        position: absolute;\n        border-radius: 50%;\n        background: rgba(255, 255, 255, 0.3);\n        animation: ripple-animation 0.6s linear;\n        pointer-events: none;\n    }\n    \n    @keyframes ripple-animation {\n        0% {\n            width: 0;\n            height: 0;\n            opacity: 1;\n        }\n        100% {\n            width: 40px;\n            height: 40px;\n            opacity: 0;\n        }\n    }\n    \n    .nav__toggle--active span:nth-child(1) {\n        transform: translateY(6px) rotate(45deg);\n    }\n    \n    .nav__toggle--active span:nth-child(2) {\n        opacity: 0;\n    }\n    \n    .nav__toggle--active span:nth-child(3) {\n        transform: translateY(-6px) rotate(-45deg);\n    }\n\n    .search-highlight {\n        background-color: var(--color-warning);\n        color: var(--color-bg-primary);\n        padding: 0 2px;\n        border-radius: 2px;\n    }\n    \n    .no-results-message {\n        text-align: center;\n        padding: var(--spacing-3xl);\n        background-color: var(--color-bg-secondary);\n        border-radius: var(--radius-lg);\n        border: 1px solid rgba(255, 255, 255, 0.1);\n        margin-top: var(--spacing-xl);\n    }\n    \n    .no-results-content h3 {\n        color: var(--color-text-primary);\n        margin-bottom: var(--spacing-md);\n    }\n    \n    .no-results-content p {\n        color: var(--color-text-secondary);\n        margin-bottom: var(--spacing-lg);\n    }\n    \n    .form-success-overlay {\n        position: fixed;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background-color: rgba(0, 0, 0, 0.8);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        z-index: var(--z-modal);\n        backdrop-filter: blur(4px);\n    }\n    \n    .form-success-message {\n        background-color: var(--color-bg-primary);\n        border: 1px solid var(--color-success);\n        border-radius: var(--radius-lg);\n        padding: var(--spacing-xl);\n        max-width: 400px;\n        width: 90%;\n        text-align: center;\n        box-shadow: var(--shadow-xl);\n    }\n    \n    .success-content {\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n        gap: var(--spacing-md);\n    }\n    \n    .success-content h3 {\n        color: var(--color-success);\n        margin: 0;\n    }\n    \n    .success-content p {\n        color: var(--color-text-secondary);\n        margin: 0;\n    }\n    \n    .form-error-message {\n        background-color: rgba(231, 76, 60, 0.1);\n        border: 1px solid var(--color-error);\n        color: var(--color-error);\n        padding: var(--spacing-md);\n        border-radius: var(--radius-md);\n        margin-bottom: var(--spacing-lg);\n        text-align: center;\n    }\n\n    .code-copy-btn {\n        position: absolute;\n        top: var(--spacing-sm);\n        right: var(--spacing-sm);\n        background-color: var(--color-bg-secondary);\n        border: 1px solid rgba(255, 255, 255, 0.1);\n        color: var(--color-text-secondary);\n        padding: var(--spacing-xs) var(--spacing-sm);\n        border-radius: var(--radius-sm);\n        font-size: var(--font-size-xs);\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        gap: var(--spacing-xs);\n        transition: all var(--transition-fast);\n    }\n    \n    .code-copy-btn:hover {\n        background-color: var(--color-bg-tertiary);\n        color: var(--color-text-primary);\n    }\n    \n    .code-copy-btn--success {\n        background-color: var(--color-success);\n        color: white;\n        border-color: var(--color-success);\n    }\n`;
    const style = document.createElement("style");
    style.textContent = additionalCSS;
    document.head.appendChild(style);
    document.addEventListener("DOMContentLoaded", (() => {
        window.tronWatchApp = new TronWatchApp;
    }));
    window.TronWatchApp = TronWatchApp;
    window["FLS"] = false;
})();