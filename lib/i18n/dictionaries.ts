import type { AppLocale } from "./locales";

export type Dictionary = {
  nav: {
    home: string;
    browse: string;
    browseShort: string;
    swaps: string;
    swapsShort: string;
    forum: string;
    forumShort: string;
    profile: string;
    profileShort: string;
  };
  menu: {
    myProfile: string;
    settings: string;
    logout: string;
    loggingOut: string;
  };
  settings: {
    title: string;
    account: string;
    security: string;
    general: string;
    session: string;
    emailAddress: string;
    gender: string;
    locationCustomization: string;
    language: string;
    logOut: string;
    logOutDesc: string;
    password: string;
    passwordDesc: string;
    passwordGoogle: string;
    change: string;
    cancel: string;
    done: string;
    save: string;
    saving: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    updatePassword: string;
    updating: string;
    emailChangeHint: string;
    locationHint: string;
    locationApproximate: string;
    locationNone: string;
    locationCountry: string;
    genderMan: string;
    genderWoman: string;
    genderNonBinary: string;
    genderPreferNot: string;
  };
};

const en: Dictionary = {
  nav: {
    home: "Home",
    browse: "Browse People",
    browseShort: "Browse",
    swaps: "Skill Swap Requests",
    swapsShort: "Swaps",
    forum: "Community Forum",
    forumShort: "Forum",
    profile: "My Profile",
    profileShort: "Profile",
  },
  menu: {
    myProfile: "My Profile",
    settings: "Settings",
    logout: "Logout",
    loggingOut: "Logging out...",
  },
  settings: {
    title: "Settings",
    account: "Account",
    security: "Security",
    general: "General",
    session: "Session",
    emailAddress: "Email address",
    gender: "Gender",
    locationCustomization: "Location customization",
    language: "Display language",
    logOut: "Log out",
    logOutDesc: "End your current session on this device.",
    password: "Password",
    passwordDesc: "Change the password you use to sign in.",
    passwordGoogle: "You signed in with Google. Password changes are managed in your Google account.",
    change: "Change",
    cancel: "Cancel",
    done: "Done",
    save: "Save",
    saving: "Saving…",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    updatePassword: "Update password",
    updating: "Updating…",
    emailChangeHint: "We'll send a confirmation link to your new address before it becomes active.",
    locationHint: "Personalize feeds and recommendations with geographically relevant content.",
    locationApproximate: "Use approximate location (based on IP)",
    locationNone: "No location specified",
    locationCountry: "Country",
    genderMan: "Man",
    genderWoman: "Woman",
    genderNonBinary: "Non-binary",
    genderPreferNot: "Prefer not to say",
  },
};

const zhCN: Dictionary = {
  nav: {
    home: "首页",
    browse: "浏览用户",
    browseShort: "浏览",
    swaps: "技能交换请求",
    swapsShort: "交换",
    forum: "社区论坛",
    forumShort: "论坛",
    profile: "我的资料",
    profileShort: "资料",
  },
  menu: {
    myProfile: "我的资料",
    settings: "设置",
    logout: "退出登录",
    loggingOut: "正在退出…",
  },
  settings: {
    title: "设置",
    account: "账户",
    security: "安全",
    general: "通用",
    session: "会话",
    emailAddress: "电子邮箱",
    gender: "性别",
    locationCustomization: "位置个性化",
    language: "显示语言",
    logOut: "退出登录",
    logOutDesc: "结束此设备上的当前会话。",
    password: "密码",
    passwordDesc: "更改用于登录的密码。",
    passwordGoogle: "你使用 Google 登录。请在 Google 账户中管理密码。",
    change: "更改",
    cancel: "取消",
    done: "完成",
    save: "保存",
    saving: "保存中…",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmPassword: "确认新密码",
    updatePassword: "更新密码",
    updating: "更新中…",
    emailChangeHint: "我们会向新邮箱发送确认链接，确认后才会生效。",
    locationHint: "根据地理位置个性化推荐内容。",
    locationApproximate: "使用大致位置（基于 IP）",
    locationNone: "不指定位置",
    locationCountry: "国家/地区",
    genderMan: "男",
    genderWoman: "女",
    genderNonBinary: "非二元",
    genderPreferNot: "不愿透露",
  },
};

const zhTW: Dictionary = {
  ...zhCN,
  nav: {
    home: "首頁",
    browse: "瀏覽用戶",
    browseShort: "瀏覽",
    swaps: "技能交換請求",
    swapsShort: "交換",
    forum: "社群論壇",
    forumShort: "論壇",
    profile: "我的資料",
    profileShort: "資料",
  },
  menu: {
    myProfile: "我的資料",
    settings: "設定",
    logout: "登出",
    loggingOut: "正在登出…",
  },
  settings: {
    ...zhCN.settings,
    title: "設定",
    account: "帳戶",
    security: "安全",
    general: "一般",
    session: "工作階段",
    emailAddress: "電子郵件",
    gender: "性別",
    locationCustomization: "位置個人化",
    language: "顯示語言",
    logOut: "登出",
    logOutDesc: "結束此裝置上的目前工作階段。",
    password: "密碼",
    passwordDesc: "變更用來登入的密碼。",
    passwordGoogle: "你使用 Google 登入。請在 Google 帳戶中管理密碼。",
    change: "變更",
    cancel: "取消",
    done: "完成",
    save: "儲存",
    saving: "儲存中…",
    currentPassword: "目前密碼",
    newPassword: "新密碼",
    confirmPassword: "確認新密碼",
    updatePassword: "更新密碼",
    updating: "更新中…",
    emailChangeHint: "我們會向新信箱傳送確認連結，確認後才會生效。",
    locationHint: "依地理位置個人化推薦內容。",
    locationApproximate: "使用大致位置（依 IP）",
    locationNone: "不指定位置",
    locationCountry: "國家/地區",
    genderMan: "男",
    genderWoman: "女",
    genderNonBinary: "非二元",
    genderPreferNot: "不願透露",
  },
};

const id: Dictionary = {
  nav: {
    home: "Beranda",
    browse: "Jelajahi Orang",
    browseShort: "Jelajah",
    swaps: "Permintaan Tukar Skill",
    swapsShort: "Tukar",
    forum: "Forum Komunitas",
    forumShort: "Forum",
    profile: "Profil Saya",
    profileShort: "Profil",
  },
  menu: {
    myProfile: "Profil Saya",
    settings: "Pengaturan",
    logout: "Keluar",
    loggingOut: "Sedang keluar...",
  },
  settings: {
    title: "Pengaturan",
    account: "Akun",
    security: "Keamanan",
    general: "Umum",
    session: "Sesi",
    emailAddress: "Alamat email",
    gender: "Jenis kelamin",
    locationCustomization: "Kustomisasi lokasi",
    language: "Bahasa tampilan",
    logOut: "Keluar",
    logOutDesc: "Akhiri sesi Anda di perangkat ini.",
    password: "Kata sandi",
    passwordDesc: "Ubah kata sandi yang digunakan untuk masuk.",
    passwordGoogle: "Anda masuk dengan Google. Kelola kata sandi di akun Google Anda.",
    change: "Ubah",
    cancel: "Batal",
    done: "Selesai",
    save: "Simpan",
    saving: "Menyimpan…",
    currentPassword: "Kata sandi saat ini",
    newPassword: "Kata sandi baru",
    confirmPassword: "Konfirmasi kata sandi baru",
    updatePassword: "Perbarui kata sandi",
    updating: "Memperbarui…",
    emailChangeHint: "Kami akan mengirim tautan konfirmasi ke alamat baru sebelum aktif.",
    locationHint: "Personalisasi feed dan rekomendasi berdasarkan lokasi.",
    locationApproximate: "Gunakan lokasi perkiraan (berdasarkan IP)",
    locationNone: "Tidak ada lokasi yang ditentukan",
    locationCountry: "Negara",
    genderMan: "Pria",
    genderWoman: "Wanita",
    genderNonBinary: "Non-biner",
    genderPreferNot: "Lebih suka tidak mengatakan",
  },
};

const ja: Dictionary = {
  nav: {
    home: "ホーム",
    browse: "人を探す",
    browseShort: "探す",
    swaps: "スキルスワップ申請",
    swapsShort: "スワップ",
    forum: "コミュニティフォーラム",
    forumShort: "フォーラム",
    profile: "マイプロフィール",
    profileShort: "プロフィール",
  },
  menu: {
    myProfile: "マイプロフィール",
    settings: "設定",
    logout: "ログアウト",
    loggingOut: "ログアウト中…",
  },
  settings: {
    title: "設定",
    account: "アカウント",
    security: "セキュリティ",
    general: "一般",
    session: "セッション",
    emailAddress: "メールアドレス",
    gender: "性別",
    locationCustomization: "位置情報のカスタマイズ",
    language: "表示言語",
    logOut: "ログアウト",
    logOutDesc: "この端末の現在のセッションを終了します。",
    password: "パスワード",
    passwordDesc: "ログインに使用するパスワードを変更します。",
    passwordGoogle: "Google でログインしています。パスワードは Google アカウントで管理してください。",
    change: "変更",
    cancel: "キャンセル",
    done: "完了",
    save: "保存",
    saving: "保存中…",
    currentPassword: "現在のパスワード",
    newPassword: "新しいパスワード",
    confirmPassword: "新しいパスワード（確認）",
    updatePassword: "パスワードを更新",
    updating: "更新中…",
    emailChangeHint: "新しいアドレスに確認リンクを送ります。確認後に有効になります。",
    locationHint: "地域に関連するコンテンツでフィードをパーソナライズします。",
    locationApproximate: "おおよその位置を使用（IP ベース）",
    locationNone: "位置を指定しない",
    locationCountry: "国",
    genderMan: "男性",
    genderWoman: "女性",
    genderNonBinary: "ノンバイナリー",
    genderPreferNot: "回答しない",
  },
};

const ko: Dictionary = {
  nav: {
    home: "홈",
    browse: "사람 찾아보기",
    browseShort: "찾기",
    swaps: "스킬 교환 요청",
    swapsShort: "교환",
    forum: "커뮤니티 포럼",
    forumShort: "포럼",
    profile: "내 프로필",
    profileShort: "프로필",
  },
  menu: {
    myProfile: "내 프로필",
    settings: "설정",
    logout: "로그아웃",
    loggingOut: "로그아웃 중…",
  },
  settings: {
    title: "설정",
    account: "계정",
    security: "보안",
    general: "일반",
    session: "세션",
    emailAddress: "이메일 주소",
    gender: "성별",
    locationCustomization: "위치 맞춤설정",
    language: "표시 언어",
    logOut: "로그아웃",
    logOutDesc: "이 기기의 현재 세션을 종료합니다.",
    password: "비밀번호",
    passwordDesc: "로그인에 사용하는 비밀번호를 변경합니다.",
    passwordGoogle: "Google로 로그인했습니다. 비밀번호는 Google 계정에서 관리하세요.",
    change: "변경",
    cancel: "취소",
    done: "완료",
    save: "저장",
    saving: "저장 중…",
    currentPassword: "현재 비밀번호",
    newPassword: "새 비밀번호",
    confirmPassword: "새 비밀번호 확인",
    updatePassword: "비밀번호 업데이트",
    updating: "업데이트 중…",
    emailChangeHint: "새 주소로 확인 링크를 보냅니다. 확인 후 적용됩니다.",
    locationHint: "지역 관련 콘텐츠로 피드와 추천을 맞춤 설정합니다.",
    locationApproximate: "대략적인 위치 사용 (IP 기반)",
    locationNone: "위치 지정 안 함",
    locationCountry: "국가",
    genderMan: "남성",
    genderWoman: "여성",
    genderNonBinary: "논바이너리",
    genderPreferNot: "밝히지 않음",
  },
};

/** Fallback dictionaries reuse English structure with localized core strings where provided. */
function partial(overrides: DeepPartial<Dictionary>): Dictionary {
  return {
    nav: { ...en.nav, ...overrides.nav },
    menu: { ...en.menu, ...overrides.menu },
    settings: { ...en.settings, ...overrides.settings },
  };
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

const es = partial({
  nav: { home: "Inicio", browse: "Explorar personas", browseShort: "Explorar", swaps: "Solicitudes de intercambio", swapsShort: "Intercambios", forum: "Foro comunitario", forumShort: "Foro", profile: "Mi perfil", profileShort: "Perfil" },
  menu: { myProfile: "Mi perfil", settings: "Ajustes", logout: "Cerrar sesión", loggingOut: "Cerrando sesión..." },
  settings: { title: "Ajustes", account: "Cuenta", security: "Seguridad", general: "General", session: "Sesión", emailAddress: "Correo electrónico", gender: "Género", locationCustomization: "Personalización de ubicación", language: "Idioma de visualización", logOut: "Cerrar sesión", done: "Listo", save: "Guardar", change: "Cambiar", cancel: "Cancelar" },
});

const fr = partial({
  nav: { home: "Accueil", browse: "Parcourir", browseShort: "Parcourir", swaps: "Demandes d'échange", swapsShort: "Échanges", forum: "Forum communautaire", forumShort: "Forum", profile: "Mon profil", profileShort: "Profil" },
  menu: { myProfile: "Mon profil", settings: "Paramètres", logout: "Déconnexion", loggingOut: "Déconnexion..." },
  settings: { title: "Paramètres", account: "Compte", security: "Sécurité", general: "Général", session: "Session", emailAddress: "Adresse e-mail", gender: "Genre", locationCustomization: "Personnalisation de la localisation", language: "Langue d'affichage", logOut: "Se déconnecter", done: "Terminé", save: "Enregistrer", change: "Modifier", cancel: "Annuler" },
});

const de = partial({
  nav: { home: "Start", browse: "Personen entdecken", browseShort: "Entdecken", swaps: "Skill-Tausch-Anfragen", swapsShort: "Tausch", forum: "Community-Forum", forumShort: "Forum", profile: "Mein Profil", profileShort: "Profil" },
  menu: { myProfile: "Mein Profil", settings: "Einstellungen", logout: "Abmelden", loggingOut: "Abmelden..." },
  settings: { title: "Einstellungen", account: "Konto", security: "Sicherheit", general: "Allgemein", session: "Sitzung", emailAddress: "E-Mail-Adresse", gender: "Geschlecht", locationCustomization: "Standortanpassung", language: "Anzeigesprache", logOut: "Abmelden", done: "Fertig", save: "Speichern", change: "Ändern", cancel: "Abbrechen" },
});

const ptBR = partial({
  nav: { home: "Início", browse: "Explorar pessoas", browseShort: "Explorar", swaps: "Pedidos de troca", swapsShort: "Trocas", forum: "Fórum da comunidade", forumShort: "Fórum", profile: "Meu perfil", profileShort: "Perfil" },
  menu: { myProfile: "Meu perfil", settings: "Configurações", logout: "Sair", loggingOut: "Saindo..." },
  settings: { title: "Configurações", account: "Conta", security: "Segurança", general: "Geral", session: "Sessão", emailAddress: "Endereço de e-mail", gender: "Gênero", locationCustomization: "Personalização de localização", language: "Idioma de exibição", logOut: "Sair", done: "Concluído", save: "Salvar", change: "Alterar", cancel: "Cancelar" },
});

const th = partial({
  nav: { home: "หน้าแรก", browse: "ค้นหาผู้คน", browseShort: "ค้นหา", swaps: "คำขอแลกสกิล", swapsShort: "แลก", forum: "ฟอรัมชุมชน", forumShort: "ฟอรัม", profile: "โปรไฟล์ของฉัน", profileShort: "โปรไฟล์" },
  menu: { myProfile: "โปรไฟล์ของฉัน", settings: "การตั้งค่า", logout: "ออกจากระบบ", loggingOut: "กำลังออก..." },
  settings: { title: "การตั้งค่า", account: "บัญชี", security: "ความปลอดภัย", general: "ทั่วไป", session: "เซสชัน", emailAddress: "อีเมล", gender: "เพศ", locationCustomization: "ปรับแต่งตำแหน่ง", language: "ภาษาที่แสดง", logOut: "ออกจากระบบ", done: "เสร็จสิ้น", save: "บันทึก", change: "เปลี่ยน", cancel: "ยกเลิก" },
});

const vi = partial({
  nav: { home: "Trang chủ", browse: "Duyệt người", browseShort: "Duyệt", swaps: "Yêu cầu đổi kỹ năng", swapsShort: "Đổi", forum: "Diễn đàn cộng đồng", forumShort: "Diễn đàn", profile: "Hồ sơ của tôi", profileShort: "Hồ sơ" },
  menu: { myProfile: "Hồ sơ của tôi", settings: "Cài đặt", logout: "Đăng xuất", loggingOut: "Đang đăng xuất..." },
  settings: { title: "Cài đặt", account: "Tài khoản", security: "Bảo mật", general: "Chung", session: "Phiên", emailAddress: "Địa chỉ email", gender: "Giới tính", locationCustomization: "Tùy chỉnh vị trí", language: "Ngôn ngữ hiển thị", logOut: "Đăng xuất", done: "Xong", save: "Lưu", change: "Thay đổi", cancel: "Hủy" },
});

const ms = partial({
  nav: { home: "Laman Utama", browse: "Layari Orang", browseShort: "Layari", swaps: "Permintaan Tukar Skill", swapsShort: "Tukar", forum: "Forum Komuniti", forumShort: "Forum", profile: "Profil Saya", profileShort: "Profil" },
  menu: { myProfile: "Profil Saya", settings: "Tetapan", logout: "Log keluar", loggingOut: "Sedang log keluar..." },
  settings: { title: "Tetapan", account: "Akaun", security: "Keselamatan", general: "Umum", session: "Sesi", emailAddress: "Alamat e-mel", gender: "Jantina", locationCustomization: "Penyesuaian lokasi", language: "Bahasa paparan", logOut: "Log keluar", done: "Selesai", save: "Simpan", change: "Tukar", cancel: "Batal" },
});

const hi = partial({
  nav: { home: "होम", browse: "लोग देखें", browseShort: "देखें", swaps: "स्किल स्वैप अनुरोध", swapsShort: "स्वैप", forum: "कम्युनिटी फोरम", forumShort: "फोरम", profile: "मेरी प्रोफ़ाइल", profileShort: "प्रोफ़ाइल" },
  menu: { myProfile: "मेरी प्रोफ़ाइल", settings: "सेटिंग्स", logout: "लॉग आउट", loggingOut: "लॉग आउट हो रहा है..." },
  settings: { title: "सेटिंग्स", account: "खाता", security: "सुरक्षा", general: "सामान्य", session: "सत्र", emailAddress: "ईमेल पता", gender: "लिंग", locationCustomization: "स्थान अनुकूलन", language: "प्रदर्शन भाषा", logOut: "लॉग आउट", done: "हो गया", save: "सहेजें", change: "बदलें", cancel: "रद्द करें" },
});

const ar = partial({
  nav: { home: "الرئيسية", browse: "تصفح الأشخاص", browseShort: "تصفح", swaps: "طلبات تبادل المهارات", swapsShort: "تبادل", forum: "منتدى المجتمع", forumShort: "المنتدى", profile: "ملفي الشخصي", profileShort: "الملف" },
  menu: { myProfile: "ملفي الشخصي", settings: "الإعدادات", logout: "تسجيل الخروج", loggingOut: "جارٍ تسجيل الخروج..." },
  settings: { title: "الإعدادات", account: "الحساب", security: "الأمان", general: "عام", session: "الجلسة", emailAddress: "البريد الإلكتروني", gender: "الجنس", locationCustomization: "تخصيص الموقع", language: "لغة العرض", logOut: "تسجيل الخروج", done: "تم", save: "حفظ", change: "تغيير", cancel: "إلغاء" },
});

export const DICTIONARIES: Record<AppLocale, Dictionary> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  id,
  ja,
  ko,
  es,
  fr,
  de,
  "pt-BR": ptBR,
  th,
  vi,
  ms,
  hi,
  ar,
};

export function getDictionary(locale: AppLocale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}
