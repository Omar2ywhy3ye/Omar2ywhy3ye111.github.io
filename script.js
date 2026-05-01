document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1) DARK / LIGHT THEME — بيشتغل في كل الصفحات
  //    - بيحفظ الاختيار في localStorage عشان يفضل محفوظ
  //    - بيغير أيقونة كل أزرار الثيم في الصفحة تلقائياً
  // ============================================================
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  window.toggleTheme = function () {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // بنحدّث كل أزرار الثيم في الصفحة (مش بس الأول)
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    });
  };

  // نحدّث الأيقونة عند تحميل الصفحة حسب الحالة المحفوظة
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.innerHTML = document.body.classList.contains('dark')
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
    // نربط كل زرار بـ toggleTheme بشكل برمجي بالإضافة للـ onclick في HTML
    btn.addEventListener('click', window.toggleTheme);
  });


  // ============================================================
  // 2) SESSION STORAGE — تتبع آخر صفحة زارها المستخدم
  // ============================================================
  sessionStorage.setItem('lastVisitedPage', window.location.pathname);
  const lastPageEl = document.getElementById('lastPage');
  if (lastPageEl) {
    lastPageEl.textContent = sessionStorage.getItem('lastVisitedPage') || 'First visit';
  }


  // ============================================================
  // 3) NAVIGATION OVERLAY — القائمة الجانبية
  //    - openMenu() / closeMenu() متاحين globally
  //    - بيستجيب لـ Escape key وللنقر خارج القائمة
  //    - يشتغل مع كل الصفحات
  // ============================================================
  const navOverlay = document.getElementById('navOverlay');
  const closeNavBtn = document.getElementById('closeNavBtn') || document.getElementById('closeNav');

  window.openMenu = function() {
    if (navOverlay) navOverlay.classList.add('active');
  };
  window.closeMenu = function() {
    if (navOverlay) navOverlay.classList.remove('active');
  };

  // زرار ☰ — نربطه برمجياً بالإضافة للـ onclick في HTML
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', window.openMenu);

  if (closeNavBtn) closeNavBtn.addEventListener('click', window.closeMenu);

  if (navOverlay) {
    navOverlay.addEventListener('click', (e) => {
      if (e.target === navOverlay) window.closeMenu();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeMenu();
  });


  // ============================================================
  // 4) ORDER BUTTONS — بيوديك لصفحة الـ Delivery
  //    .core-order بدل ما نمنع كل order-card-btn
  //    عشان زرار السيرش في المنيو ميتأثرش
  // ============================================================
  document.querySelectorAll('.core-order').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'delivery.html';
    });
  });


  // ============================================================
  // 5) RESERVATION FORM — Validation + localStorage
  //    - بيتحقق من الاسم والتاريخ والإيميل والوقت والتليفون
  //    - بيحفظ البيانات في localStorage
  //    - بيعيد الداتا المحفوظة لو فتح الصفحة تاني
  // ============================================================
  const reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    const savedName  = localStorage.getItem('res_name');
    const savedEmail = localStorage.getItem('res_email');
    const savedPhone = localStorage.getItem('res_phone');
    if (savedName)  reservationForm.querySelector('input[type="text"]').value  = savedName;
    if (savedEmail) reservationForm.querySelector('input[type="email"]').value = savedEmail;
    if (savedPhone) reservationForm.querySelector('input[type="tel"]').value   = savedPhone;

    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput  = reservationForm.querySelector('input[type="text"]');
      const dateInput  = reservationForm.querySelector('input[type="date"]');
      const emailInput = reservationForm.querySelector('input[type="email"]');
      const timeInput  = reservationForm.querySelector('input[type="time"]');
      const phoneInput = reservationForm.querySelector('input[type="tel"]');

      clearErrors(reservationForm);
      let valid = true;
      const name  = nameInput.value.trim();
      const date  = dateInput.value.trim();
      const email = emailInput.value.trim();
      const time  = timeInput.value.trim();
      const phone = phoneInput.value.trim();

      if (name.length < 3)    { showError(nameInput,  'Name must be at least 3 characters.'); valid = false; }
      else if (/\d/.test(name)) { showError(nameInput, 'Name must not contain numbers.'); valid = false; }
      if (!date) { showError(dateInput, 'Please select a date.'); valid = false; }
      else {
        const sel = new Date(date), today = new Date();
        today.setHours(0,0,0,0);
        if (sel < today) { showError(dateInput, 'Date must be today or in the future.'); valid = false; }
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(emailInput, 'Please enter a valid email.'); valid = false; }
      if (!time)  { showError(timeInput,  'Please select a time.'); valid = false; }
      if (!/^[0-9\+\-\s]{7,15}$/.test(phone)) { showError(phoneInput, 'Phone must be 7-15 digits.'); valid = false; }

      if (!valid) return;
      localStorage.setItem('res_name',  name);
      localStorage.setItem('res_email', email);
      localStorage.setItem('res_phone', phone);
      const count = parseInt(sessionStorage.getItem('reservationCount') || '0') + 1;
      sessionStorage.setItem('reservationCount', count);
      alert('Reservation confirmed! We will contact you soon.\n(Reservations this session: ' + count + ')');
      reservationForm.reset();
    });
  }


  // ============================================================
  // 6) CONTACT FORM — sessionStorage لحفظ الموضوع
  //    بيحفظ حقل الـ Subject تلقائياً ويرجّعه في نفس الجلسة
  // ============================================================
  const contactForm = document.querySelector('.contact-form-side form');
  if (contactForm) {
    const savedSubject = sessionStorage.getItem('contact_subject');
    if (savedSubject) {
      const subjectInput = contactForm.querySelector('input[placeholder="What\'s this about?"]');
      if (subjectInput) subjectInput.value = savedSubject;
    }
    const subjectField = contactForm.querySelector('input[placeholder="What\'s this about?"]');
    if (subjectField) {
      subjectField.addEventListener('input', () => {
        sessionStorage.setItem('contact_subject', subjectField.value);
      });
    }
  }


  // ============================================================
  // 7) MENU SEARCH — بيشتغل في صفحة menu.html فقط
  //    الفكرة:
  //    - لما تكتب حرف → كل الأقسام (كروت + جدول) بتختفي
  //    - الجدول بيظهر لوحده بس الصفوف المطابقة
  //    - الصف المطابق بيتلوّن بخلفية برتقالية واضحة
  //    - الحرف المكتوب داخل خلية الاسم بيتلوّن بـ highlight
  //    - لما تمسح السيرش كل حاجة بترجع زي ما كانت
  // ============================================================
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();

      // كل الأقسام اللي هنخبيها لما يكون في سيرش
      const allSections    = document.querySelectorAll('.one, .two');
      // قسم الجدول اللي هيظهر بس
      const tableSection   = document.querySelector('.price-table-section');
      // الجدول نفسه
      const table          = document.querySelector('.menu-price-table');
      // كل صفوف الـ tbody (مش الـ thead أو tfoot)
      const rows           = table ? table.querySelectorAll('tbody tr') : [];
      // عنوان السيرش اللي بيوضح عدد النتايج
      const searchTitle    = document.getElementById('searchResultsTitle');

      // ======= لو السيرش فاضي — رجّع كل حاجة لطبيعتها =======
      if (!query) {
        // أظهر كل الأقسام
        allSections.forEach(s => s.style.display = '');
        // أظهر الجدول بشكله الأصلي
        if (tableSection) tableSection.style.display = '';
        // امسح أي highlight أو إخفاء على الصفوف
        rows.forEach(row => {
          row.style.display = '';
          row.classList.remove('row-highlight');
          // امسح الـ highlight من نص الخلية
          row.querySelectorAll('td').forEach(td => {
            td.innerHTML = td.innerHTML.replace(/<mark class="search-mark">([^<]*)<\/mark>/gi, '$1');
          });
        });
        // إخفاء عنوان النتايج
        if (searchTitle) searchTitle.style.display = 'none';
        return;
      }

      // ======= لو في نص في السيرش =======

      // خبّي الكروت — الجدول بس اللي يظهر
      allSections.forEach(s => s.style.display = 'none');
      if (tableSection) tableSection.style.display = '';

      let matchCount = 0;

      // اعمل reset أول على كل الصفوف قبل ما نفلتر
      rows.forEach(row => {
        row.style.display = '';
        row.classList.remove('row-highlight');
        // امسح أي mark قديم
        row.querySelectorAll('td').forEach(td => {
          td.innerHTML = td.innerHTML.replace(/<mark class="search-mark">([^<]*)<\/mark>/gi, '$1');
        });
      });

      // نتحقق من كل صف — خلية الاسم هي الـ td الثانية (index 1) في الصفوف العادية
      // بعض الصفوف فيها td أول هي الـ category (rowspan) فبنتعامل مع حالتين
      rows.forEach(row => {
        const cells   = row.querySelectorAll('td');
        // لو الصف فيه 4 خلايا → Category | Item | Price | Available
        // لو فيه 3 خلايا → Item | Price | Available (الـ category بتاعتها rowspan من فوق)
        const itemCell = cells.length >= 4 ? cells[1] : cells[0];

        if (!itemCell) { row.style.display = 'none'; return; }

        const itemText = itemCell.textContent.toLowerCase();

        if (itemText.startsWith(query)) {
          // الصف مطابق — بنحدده ونلوّنه
          row.style.display = '';
          row.classList.add('row-highlight');
          matchCount++;

          // highlight الحروف المطابقة داخل الخلية
          const original = itemCell.textContent;
          const idx = original.toLowerCase().indexOf(query);
          if (idx !== -1) {
            itemCell.innerHTML =
              original.slice(0, idx) +
              '<mark class="search-mark">' + original.slice(idx, idx + query.length) + '</mark>' +
              original.slice(idx + query.length);
          }
        } else {
          // الصف مش مطابق — نخبيه
          row.style.display = 'none';
        }
      });

      // عرض عنوان يوضح عدد النتايج
      if (searchTitle) {
        searchTitle.style.display = '';
        searchTitle.innerHTML = matchCount > 0
          ? '<i class="fa-solid fa-magnifying-glass"></i> Results for "<strong>' + this.value + '</strong>" — ' + matchCount + ' item' + (matchCount > 1 ? 's' : '') + ' found'
          : '<i class="fa-solid fa-circle-exclamation"></i> No results for "<strong>' + this.value + '</strong>"';
      }
    });
  }


  // ============================================================
  // 8) LOGIN FORM VALIDATION
  //    - بيتحقق من الإيميل والباسورد
  //    - لو الداتا صح يروح لـ index.html (الصفحة الرئيسية)
  //    - مش profile.html لأن المستخدم بيعمل sign in مش تسجيل جديد
  // ============================================================
  const togglePassLogin = document.getElementById('togglePass');
  // بس في صفحة login (مش signup)
  if (togglePassLogin && !document.getElementById('signupForm')) {
    togglePassLogin.addEventListener('click', function () {
      const input = this.closest('.input-eye').querySelector('input');
      const icon  = this.querySelector('i');
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  }

  const loginForm = document.querySelector('.auth-form');
  if (loginForm && !document.getElementById('signupForm')) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
      let valid = true;
      const email = this.querySelector('input[type="email"]').value.trim();
      const pass  = this.querySelector('input[type="password"]').value;

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('err-email').textContent = 'Enter a valid email';
        valid = false;
      }
      if (pass.length < 5) {
        document.getElementById('err-pass').textContent = 'Password is too short';
        valid = false;
      }
      // redirect لـ index.html (الهوم) بعد الـ login
      if (valid) window.location.href = 'index.html';
    });
  }


  // ============================================================
  // 9) SIGNUP FORM — التسجيل الجديد
  //    - preview للصورة قبل الرفع
  //    - validation لكل الحقول مع رسايل خطأ واضحة
  //    - حفظ بيانات اليوزر في sessionStorage
  //    - redirect لصفحة البروفايل بعد نجاح التسجيل
  // ============================================================
  const avatarInput   = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');

  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        avatarPreview.style.cssText = 'background-image:url(' + e.target.result + ');background-size:cover;background-position:center';
        avatarPreview.innerHTML = '';
      };
      reader.readAsDataURL(file);
    });
  }

  function toggleVisibility(btnId, inputId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      const input = document.getElementById(inputId);
      const icon = this.querySelector('i');
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    toggleVisibility('togglePass', 'password');
    toggleVisibility('toggleConfirm', 'confirmPassword');

    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
      let valid = true;

      const name    = document.getElementById('fullname').value.trim();
      const email   = document.getElementById('email').value.trim();
      const phone   = document.getElementById('phone').value.trim();
      const pass    = document.getElementById('password').value;
      const confirm = document.getElementById('confirmPassword').value;

      if (!name)  { document.getElementById('err-name').textContent    = 'Name is required'; valid = false; }
      if (!email || !/\S+@\S+\.\S+/.test(email)) { document.getElementById('err-email').textContent = 'Enter a valid email'; valid = false; }
      if (!phone) { document.getElementById('err-phone').textContent   = 'Phone is required'; valid = false; }
      if (pass.length < 8) { document.getElementById('err-pass').textContent    = 'Min 8 characters'; valid = false; }
      if (pass !== confirm) { document.getElementById('err-confirm').textContent = 'Passwords do not match'; valid = false; }

      if (valid) {
        sessionStorage.setItem('mb_user', JSON.stringify({
          name, email, phone,
          avatar: avatarPreview ? avatarPreview.style.backgroundImage : ''
        }));
        window.location.href = 'profile.html';
      }
    });
  }


  // ============================================================
  // 10) PROFILE PAGE — تحميل وتعديل بيانات اليوزر
  //     - بيحمّل البيانات من sessionStorage عند دخول الصفحة
  //     - بيعرض الاسم والإيميل والتليفون والصورة
  //     - بيحفظ التعديلات مع Toast تأكيد
  //     - logout بيمسح sessionStorage ويروح لـ login.html
  // ============================================================
  const profileAvatar = document.getElementById('profileAvatar');
  const profileName   = document.getElementById('profileName');

  if (profileAvatar && profileName) {
    const stored = sessionStorage.getItem('mb_user');
    const user = stored ? JSON.parse(stored) : { name: 'Guest User', email: '', phone: '', avatar: '' };

    function loadProfile() {
      const pEmail = document.getElementById('profileEmail');
      const pPhone = document.getElementById('profilePhone');
      profileName.textContent = user.name || 'Good morning!';
      if (pEmail) pEmail.innerHTML = '<i class="fa-solid fa-envelope"></i> ' + (user.email || '—');
      if (pPhone) pPhone.innerHTML = '<i class="fa-solid fa-phone"></i> ' + (user.phone || '—');
      if (user.avatar) {
        profileAvatar.style.backgroundImage = user.avatar;
        profileAvatar.style.backgroundSize = 'cover';
        profileAvatar.style.backgroundPosition = 'center';
        profileAvatar.innerHTML = '';
      }
      const editName  = document.getElementById('editName');
      const editEmail = document.getElementById('editEmail');
      const editPhone = document.getElementById('editPhone');
      if (editName)  editName.value  = user.name  || '';
      if (editEmail) editEmail.value = user.email || '';
      if (editPhone) editPhone.value = user.phone || '';
    }
    loadProfile();

    // تغيير الصورة
    const profileAvatarInput = document.getElementById('profileAvatarInput');
    if (profileAvatarInput) {
      profileAvatarInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
          profileAvatar.style.backgroundImage = 'url(' + e.target.result + ')';
          profileAvatar.style.backgroundSize = 'cover';
          profileAvatar.style.backgroundPosition = 'center';
          profileAvatar.innerHTML = '';
          user.avatar = 'url(' + e.target.result + ')';
          sessionStorage.setItem('mb_user', JSON.stringify(user));
        };
        reader.readAsDataURL(file);
      });
    }

    // toggle password في البروفايل
    const toggleEditPass = document.getElementById('toggleEditPass');
    if (toggleEditPass) {
      toggleEditPass.addEventListener('click', function () {
        const input = document.getElementById('editPass');
        const icon  = this.querySelector('i');
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      });
    }

    // حفظ التعديلات
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        let valid = true;

        const name  = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const phone = document.getElementById('editPhone').value.trim();

        if (!name)  { document.getElementById('p-err-name').textContent  = 'Name is required'; valid = false; }
        if (!email || !/\S+@\S+\.\S+/.test(email)) { document.getElementById('p-err-email').textContent = 'Valid email required'; valid = false; }

        if (!valid) return;
        user.name  = name;
        user.email = email;
        user.phone = phone;
        sessionStorage.setItem('mb_user', JSON.stringify(user));
        loadProfile();

        const toast = document.getElementById('toast');
        if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
      });
    }

    // logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('mb_user');
        window.location.href = 'login.html';
      });
    }
  }

}); // end DOMContentLoaded


// ============================================================
// 11) TOAST + CONTACT FORM VALIDATION — global function
//     بيتحقق من حقول الـ contact form ويعرض Toast لمدة 3 ثواني
// ============================================================
function showToast(event) {
  event.preventDefault();
  const form = event.target;
  const nameInput    = form.querySelector('input[type="text"]');
  const emailInput   = form.querySelector('input[type="email"]');
  const subjectInput = form.querySelector('input[placeholder="What\'s this about?"]');
  const msgInput     = form.querySelector('textarea');

  clearErrors(form);
  let valid = true;

  if (nameInput.value.trim().length < 2)    { showError(nameInput,    'Name must be at least 2 characters.'); valid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) { showError(emailInput, 'Please enter a valid email.'); valid = false; }
  if (subjectInput.value.trim().length < 3) { showError(subjectInput, 'Subject must be at least 3 characters.'); valid = false; }
  if (msgInput.value.trim().length < 10)    { showError(msgInput,     'Message must be at least 10 characters.'); valid = false; }

  if (!valid) return;

  localStorage.setItem('lastContactName', nameInput.value.trim());
  sessionStorage.removeItem('contact_subject');

  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
  form.reset();
}


// ============================================================
// 12) HELPER FUNCTIONS — showError / clearErrors
//     - showError: بيضيف رسالة خطأ تحت الحقل ويحمّر الـ border
//     - clearErrors: بيمسح كل رسايل الخطأ والـ border الأحمر
// ============================================================
function showError(input, message) {
  input.style.borderColor = '#e03e3e';
  const err = document.createElement('span');
  err.className = 'form-error';
  err.textContent = message;
  input.parentNode.appendChild(err);
}

function clearErrors(form) {
  form.querySelectorAll('.form-error').forEach(el => el.remove());
  form.querySelectorAll('input, textarea, select').forEach(el => { el.style.borderColor = ''; });
}