/**
 * «Сытый кот» — интерактив лендинга
 * 1. Тень шапки при скролле
 * 2. Мобильное меню (бургер)
 * 3. Плавное появление секций при скролле
 * 4. Валидация и «отправка» формы бронирования
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1. Тень шапки ---------- */
    var header = document.querySelector('.header');

    function onScroll() {
      if (!header) return;
      header.classList.toggle('header--scrolled', window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- 2. Мобильное меню ---------- */
    var burger = document.querySelector('.burger');
    var nav = document.querySelector('.nav');

    function closeMenu() {
      if (!nav || !burger) return;
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
      document.body.classList.remove('no-scroll');
    }

    if (burger && nav) {
      burger.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(isOpen));
        burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
        document.body.classList.toggle('no-scroll', isOpen);
      });

      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      // Закрытие по Esc
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });

      // Сброс меню при переходе на десктоп
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 900) closeMenu();
      });
    }

    /* ---------- 3. Появление при скролле ---------- */
    var revealItems = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
      });

      revealItems.forEach(function (item) { observer.observe(item); });
    } else {
      // Фолбэк для старых браузеров
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }

    /* ---------- 4. Форма бронирования ---------- */
    var form = document.getElementById('booking-form');
    var success = document.getElementById('form-success');
    var resetBtn = document.getElementById('form-reset');

    if (form) {
      var nameInput = form.querySelector('#name');
      var phoneInput = form.querySelector('#phone');
      var consent = form.querySelector('#consent');

      function setError(fieldName, message) {
        var errorEl = form.querySelector('[data-error-for="' + fieldName + '"]');
        if (errorEl) errorEl.textContent = message || '';
      }

      function markInvalid(input, isInvalid) {
        if (input) input.classList.toggle('is-invalid', isInvalid);
      }

      // Разрешаем вводить только цифры и символы телефона
      if (phoneInput) {
        phoneInput.addEventListener('input', function () {
          this.value = this.value.replace(/[^\d+\-()\s]/g, '');
        });
      }

      function validate() {
        var isValid = true;

        // Имя
        var nameValue = nameInput.value.trim();
        if (nameValue.length < 2) {
          setError('name', 'Пожалуйста, укажите имя (минимум 2 символа)');
          markInvalid(nameInput, true);
          isValid = false;
        } else {
          setError('name', '');
          markInvalid(nameInput, false);
        }

        // Телефон
        var digits = phoneInput.value.replace(/\D/g, '');
        if (digits.length < 10) {
          setError('phone', 'Введите корректный номер телефона');
          markInvalid(phoneInput, true);
          isValid = false;
        } else {
          setError('phone', '');
          markInvalid(phoneInput, false);
        }

        // Согласие
        if (!consent.checked) {
          setError('consent', 'Без согласия мы не сможем принять заявку');
          isValid = false;
        } else {
          setError('consent', '');
        }

        return isValid;
      }

      // Снимаем ошибку по мере ввода
      [nameInput, phoneInput, consent].forEach(function (el) {
        if (!el) return;
        var evt = el === consent ? 'change' : 'input';
        el.addEventListener(evt, function () {
          if (el === consent) {
            if (consent.checked) setError('consent', '');
          } else {
            el.classList.remove('is-invalid');
          }
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validate()) {
          var firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        // Имитация отправки на сервер
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Отправляем…';
        }

        setTimeout(function () {
          form.hidden = true;
          if (success) {
            success.hidden = false;
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 700);
      });

      // Повторная заявка
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          form.reset();
          form.hidden = false;
          if (success) success.hidden = true;

          var submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Забронировать столик';
          }
          [nameInput, phoneInput].forEach(function (el) {
            if (el) el.classList.remove('is-invalid');
          });
          form.querySelectorAll('.field__error').forEach(function (el) {
            el.textContent = '';
          });
          if (nameInput) nameInput.focus();
        });
      }
    }

    /* ---------- 5. Актуальный год в подвале ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

  });
})();