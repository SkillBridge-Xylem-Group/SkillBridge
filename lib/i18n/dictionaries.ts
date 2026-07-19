import type { AppLocale } from "./locales";
import { idPack, jaPack, koPack } from "./localePacks";

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
    saveFailed: string;
  };
  common: {
    viewAll: string;
    loading: string;
    cancel: string;
    save: string;
    confirm: string;
    delete: string;
    close: string;
    search: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    monthsAgo: string;
    yearsAgo: string;
    unknown: string;
    unread: string;
    members: string;
    member: string;
    public: string;
    private: string;
    created: string;
    join: string;
    joined: string;
    leave: string;
    manage: string;
  };
  home: {
    welcomeBack: string;
    welcomeSubtitle: string;
    findPartner: string;
    viewSwapRequests: string;
    yourProgress: string;
    level: string;
    trustScore: string;
    noRatingsYet: string;
    recentMessages: string;
    noConversationsHint: string;
    sayHello: string;
    suggestedPeople: string;
    noMatchesYet: string;
    loadMatchesFailed: string;
    recentDiscussions: string;
    noDiscussions: string;
    loadDiscussionsFailed: string;
    replies: string;
    reply: string;
  };
  messages: {
    title: string;
    searchConversations: string;
    noConversations: string;
    noConversationsHint: string;
    browsePeople: string;
    noChatsMatch: string;
    sayHello: string;
    directMessage: string;
    backToConversations: string;
    deleteConversation: string;
    deleteConversationConfirm: string;
    deleteMessage: string;
    deleteMessageConfirm: string;
    sayHelloTo: string;
    conversationStart: string;
    messagePlaceholder: string;
  };
  browse: {
    searchPlaceholder: string;
    allCategories: string;
    highestRated: string;
    mostReviews: string;
    nameAZ: string;
    loadingPeople: string;
    loadFailed: string;
    personFound: string;
    peopleFound: string;
    noMatches: string;
    noMatchesHint: string;
    noRatingsYet: string;
    noSkillsListed: string;
    viewProfile: string;
  };
  notifications: {
    title: string;
    unreadCount: string;
    allCaughtUp: string;
    newCount: string;
    typeMessage: string;
    typeSwapRequest: string;
    typeSwapUpdate: string;
    typeLevelUp: string;
    typeForum: string;
    typeReview: string;
    markAllRead: string;
    empty: string;
    emptyHint: string;
    viewSwapRequests: string;
  };
  forum: {
    latest: string;
    popular: string;
    unanswered: string;
    communities: string;
    createCommunity: string;
    manageCommunities: string;
    joinFromForum: string;
    favorite: string;
    unfavorite: string;
    createPost: string;
    createPostPlaceholder: string;
    postIn: string;
    create: string;
    posts: string;
    post: string;
    discoverTitle: string;
    discoverSubtitle: string;
    recommended: string;
    moreLike: string;
    showMore: string;
    showLess: string;
    noCommunities: string;
    noCommunitiesIn: string;
    beFirst: string;
    createCommunityIn: string;
    trendingTopics: string;
    noTrending: string;
    replies: string;
    reply: string;
    categoriesAria: string;
    notJoinedYet: string;
    noFavorites: string;
    noFilterMatch: string;
    discoverCta: string;
    tryDifferentFilter: string;
    shareWithCommunity: string;
    postingIn: string;
    community: string;
    chooseCommunity: string;
    titlePlaceholder: string;
    detailsPlaceholder: string;
    posting: string;
    postAction: string;
    createWizardAbout: string;
    createWizardAboutSub: string;
    createWizardDetails: string;
    createWizardDetailsSub: string;
    createWizardStyle: string;
    createWizardStyleSub: string;
    createWizardType: string;
    createWizardTypeSub: string;
    pickTopicError: string;
    nameDescError: string;
    chooseImageError: string;
    imageTooLarge: string;
    needSignIn: string;
    changeImage: string;
    uploadImage: string;
    visibilityPublic: string;
    visibilityPublicDesc: string;
    visibilityRestricted: string;
    visibilityRestrictedDesc: string;
    visibilityPrivate: string;
    visibilityPrivateDesc: string;
    back: string;
    next: string;
    creating: string;
    createCommunityTitle: string;
    manageTitle: string;
    manageFilterPlaceholder: string;
    leaveCommunity: string;
    allCommunities: string;
    favoritesTab: string;
  };
  profile: {
    memberSince: string;
    timezone: string;
    editProfile: string;
    saveProfile: string;
    changePhoto: string;
    bioPlaceholder: string;
    noBio: string;
    noBioHint: string;
    yourName: string;
    uploadingPhoto: string;
    saving: string;
    skillsTeach: string;
    skillsLearn: string;
    addSkill: string;
    noneAdded: string;
    searchSkills: string;
    noMatchingSkills: string;
    reviews: string;
    noReviews: string;
    noReviewsHint: string;
    achievements: string;
    unlockedCount: string;
    unlocked: string;
    levelCard: string;
    trustScore: string;
    noRatingsYet: string;
    trustNoRatingsHint: string;
    reviewCountOne: string;
    reviewCountMany: string;
    xpProgress: string;
    xpUntilLevel: string;
    tierCommon: string;
    tierRare: string;
    tierEpic: string;
    tierLegendary: string;
    message: string;
    messageUser: string;
    requestSwap: string;
    sendSwapRequest: string;
    requestSent: string;
    sending: string;
    opening: string;
    swapRequestSentNotice: string;
  };
  swaps: {
    pendingRequests: string;
    noPending: string;
    wantsToSwap: string;
    sentRequest: string;
    accept: string;
    decline: string;
    confirm: string;
    cancel: string;
    sessions: string;
    noSessions: string;
    joinSession: string;
    leaveReview: string;
    notScheduled: string;
    skillSwapSession: string;
    recentSessions: string;
    noSessionsHint: string;
    sessionInfo: string;
    swapPartner: string;
    dateTime: string;
    status: string;
    actions: string;
    markComplete: string;
    reschedule: string;
    reviewed: string;
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
    passwordGoogle:
      "You signed in with Google. Password changes are managed in your Google account.",
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
    saveFailed: "Failed to save settings.",
  },
  common: {
    viewAll: "View all",
    loading: "Loading...",
    cancel: "Cancel",
    save: "Save",
    confirm: "Confirm",
    delete: "Delete",
    close: "Close",
    search: "Search",
    justNow: "Just now",
    minutesAgo: "{n}m ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
    monthsAgo: "{n}mo ago",
    yearsAgo: "{n}y ago",
    unknown: "Unknown",
    unread: "Unread",
    members: "members",
    member: "member",
    public: "Public",
    private: "Private",
    created: "Created",
    join: "Join",
    joined: "Joined",
    leave: "Leave",
    manage: "Manage",
  },
  home: {
    welcomeBack: "Welcome back, {name}",
    welcomeSubtitle: "Ready to share your knowledge or discover a new skill today?",
    findPartner: "Find a Partner",
    viewSwapRequests: "View Swap Requests",
    yourProgress: "Your Progress",
    level: "Level {n}",
    trustScore: "Trust Score",
    noRatingsYet: "No ratings yet",
    recentMessages: "Recent Messages",
    noConversationsHint: "No conversations yet — message someone from their profile.",
    sayHello: "Say hello!",
    suggestedPeople: "Suggested People",
    noMatchesYet:
      "No matches yet - add skills you want to learn on your profile to see people who can help.",
    loadMatchesFailed: "Failed to load matches",
    recentDiscussions: "Recent Discussions",
    noDiscussions: "No recent discussions yet.",
    loadDiscussionsFailed: "Unable to load questions",
    replies: "replies",
    reply: "reply",
  },
  messages: {
    title: "Messages",
    searchConversations: "Search conversations",
    noConversations: "No conversations yet",
    noConversationsHint: "Visit someone's profile and tap Message to start chatting.",
    browsePeople: "Browse people",
    noChatsMatch: 'No chats match "{q}".',
    sayHello: "Say hello!",
    directMessage: "Direct message",
    backToConversations: "Back to conversations",
    deleteConversation: "Delete conversation",
    deleteConversationConfirm: "Delete this conversation with {name}? This can't be undone.",
    deleteMessage: "Delete message",
    deleteMessageConfirm: "Delete this message?",
    sayHelloTo: "Say hello to {name}",
    conversationStart:
      "This is the beginning of your conversation. Send a note to get the swap started.",
    messagePlaceholder: "Message {name}...",
  },
  browse: {
    searchPlaceholder: "Search by name or skill...",
    allCategories: "All Categories",
    highestRated: "Highest Rated",
    mostReviews: "Most Reviews",
    nameAZ: "Name (A-Z)",
    loadingPeople: "Loading people...",
    loadFailed: "Failed to load people",
    personFound: "{n} person found",
    peopleFound: "{n} people found",
    noMatches: "No matches yet",
    noMatchesHint: "Try a different search term or category.",
    noRatingsYet: "No ratings yet",
    noSkillsListed: "No skills listed",
    viewProfile: "View Profile",
  },
  notifications: {
    title: "Notifications",
    unreadCount: "{n} unread",
    allCaughtUp: "You're all caught up",
    newCount: "{n} new",
    typeMessage: "Message",
    typeSwapRequest: "Swap request",
    typeSwapUpdate: "Swap update",
    typeLevelUp: "Level up",
    typeForum: "Forum",
    typeReview: "Review",
    markAllRead: "Mark all read",
    empty: "No notifications yet",
    emptyHint: "Swap requests and messages will show up here.",
    viewSwapRequests: "View swap requests",
  },
  forum: {
    latest: "Latest",
    popular: "Popular",
    unanswered: "Unanswered",
    communities: "Communities",
    createCommunity: "Create community",
    manageCommunities: "Manage",
    joinFromForum: "Join communities from the Forum.",
    favorite: "Favorite",
    unfavorite: "Unfavorite",
    createPost: "Create a post",
    createPostPlaceholder: "Create a post...",
    postIn: "Post in {title}...",
    create: "Create",
    posts: "posts",
    post: "post",
    discoverTitle: "Discover Communities",
    discoverSubtitle: "Find communities to join, or create your own and start posting.",
    recommended: "Recommended for you",
    moreLike: "More like {category}",
    showMore: "Show more ({n})",
    showLess: "Show less",
    noCommunities: "No communities yet",
    noCommunitiesIn: "No communities in {category} yet",
    beFirst: "Be the first to start one.",
    createCommunityIn: "Create community in {category}",
    trendingTopics: "Trending Topics",
    noTrending: "No trending discussions yet.",
    replies: "replies",
    reply: "reply",
    categoriesAria: "Community categories",
    notJoinedYet: "You haven't joined any communities yet",
    noFavorites: "No favorited communities",
    noFilterMatch: "No communities match your filter",
    discoverCta: "Discover communities",
    tryDifferentFilter: "Try a different filter or add favorites from the list.",
    shareWithCommunity: "Share with the community",
    postingIn: "Posting in {title}",
    community: "Community",
    chooseCommunity: "Choose a community",
    titlePlaceholder: "Title",
    detailsPlaceholder: "Add details (optional if you attach an image)...",
    posting: "Posting...",
    postAction: "Post",
    createWizardAbout: "What will your community be about?",
    createWizardAboutSub: "Choose up to 3 topics to help people discover your community.",
    createWizardDetails: "Tell us about your community",
    createWizardDetailsSub: "A name and description help people understand your community.",
    createWizardStyle: "Style your community",
    createWizardStyleSub:
      "Add an icon image or color so your community stands out. You can change this later.",
    createWizardType: "What kind of community is this?",
    createWizardTypeSub: "Decide who can view and contribute. You can change this later.",
    pickTopicError: "Pick at least one topic.",
    nameDescError: "Add a name (3–21 chars) and a description.",
    chooseImageError: "Please choose an image file.",
    imageTooLarge: "Image is too large (max 10MB).",
    needSignIn: "You need to be signed in.",
    changeImage: "Change image",
    uploadImage: "Upload image",
    visibilityPublic: "Public",
    visibilityPublicDesc: "Anyone can view, post, and comment in this community.",
    visibilityRestricted: "Restricted",
    visibilityRestrictedDesc: "Anyone can view, but only approved members can post.",
    visibilityPrivate: "Private",
    visibilityPrivateDesc: "Only approved members can view and contribute.",
    back: "Back",
    next: "Next",
    creating: "Creating…",
    createCommunityTitle: "Create Community",
    manageTitle: "Manage communities",
    manageFilterPlaceholder: "Filter your communities",
    leaveCommunity: "Leave community",
    allCommunities: "All Communities",
    favoritesTab: "Favorites",
  },
  profile: {
    memberSince: "Member since",
    timezone: "Timezone",
    editProfile: "Edit Profile",
    saveProfile: "Save Profile",
    changePhoto: "Change profile photo",
    bioPlaceholder: "Tell the community a bit about yourself...",
    noBio: "No bio yet.",
    noBioHint: "Add a short bio so the community can get to know you.",
    yourName: "Your name",
    uploadingPhoto: "Uploading photo...",
    saving: "Saving...",
    skillsTeach: "Skills I can teach",
    skillsLearn: "Skills I want to learn",
    addSkill: "Add skill",
    noneAdded: "None added yet.",
    searchSkills: "Search skills...",
    noMatchingSkills: "No matching skills.",
    reviews: "Reviews",
    noReviews: "No reviews yet",
    noReviewsHint: "Complete your first skill swap to receive reviews and build your Trust Score.",
    achievements: "Achievements",
    unlockedCount: "{n} / {total} unlocked",
    unlocked: "Unlocked",
    levelCard: "Level",
    trustScore: "Trust Score",
    noRatingsYet: "No ratings yet",
    trustNoRatingsHint: "Complete your first swap to build your Trust Score.",
    reviewCountOne: "({n} review)",
    reviewCountMany: "({n} reviews)",
    xpProgress: "{current} / {next} XP",
    xpUntilLevel: "{n} XP until Level {level}",
    tierCommon: "Common",
    tierRare: "Rare",
    tierEpic: "Epic",
    tierLegendary: "Legendary",
    message: "Message",
    messageUser: "Message {name}",
    requestSwap: "Request swap",
    sendSwapRequest: "Send Swap Request",
    requestSent: "Request Sent",
    sending: "Sending...",
    opening: "Opening...",
    swapRequestSentNotice: "Swap request sent — check My Swap Requests to track it.",
  },
  swaps: {
    pendingRequests: "Pending Requests",
    noPending: "No pending requests right now.",
    wantsToSwap: "Wants to swap: {skill}",
    sentRequest: "Sent you a swap request",
    accept: "Accept",
    decline: "Decline",
    confirm: "Confirm",
    cancel: "Cancel",
    sessions: "Sessions",
    noSessions: "No sessions yet.",
    joinSession: "Join Session",
    leaveReview: "Leave a review",
    notScheduled: "Not scheduled yet",
    skillSwapSession: "Skill swap session",
    recentSessions: "Recent & Upcoming Sessions",
    noSessionsHint: "No sessions yet. Send a swap request from someone's profile to get started.",
    sessionInfo: "Session Info",
    swapPartner: "Swap Partner",
    dateTime: "Date & Time",
    status: "Status",
    actions: "Actions",
    markComplete: "Mark Complete",
    reschedule: "Reschedule",
    reviewed: "Reviewed",
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
    saveFailed: "保存设置失败。",
  },
  common: {
    viewAll: "查看全部",
    loading: "加载中…",
    cancel: "取消",
    save: "保存",
    confirm: "确认",
    delete: "删除",
    close: "关闭",
    search: "搜索",
    justNow: "刚刚",
    minutesAgo: "{n} 分钟前",
    hoursAgo: "{n} 小时前",
    daysAgo: "{n} 天前",
    monthsAgo: "{n} 个月前",
    yearsAgo: "{n} 年前",
    unknown: "未知",
    unread: "未读",
    members: "位成员",
    member: "位成员",
    public: "公开",
    private: "私密",
    created: "创建于",
    join: "加入",
    joined: "已加入",
    leave: "退出",
    manage: "管理",
  },
  home: {
    welcomeBack: "欢迎回来，{name}",
    welcomeSubtitle: "准备好分享知识，或发现一门新技能了吗？",
    findPartner: "寻找伙伴",
    viewSwapRequests: "查看交换请求",
    yourProgress: "你的进度",
    level: "等级 {n}",
    trustScore: "信任分",
    noRatingsYet: "暂无评分",
    recentMessages: "最近消息",
    noConversationsHint: "还没有对话 — 可以从对方资料页发起私信。",
    sayHello: "打个招呼吧！",
    suggestedPeople: "推荐用户",
    noMatchesYet: "暂无匹配 — 在资料中添加想学的技能，即可看到能帮助你的人。",
    loadMatchesFailed: "加载推荐失败",
    recentDiscussions: "最近讨论",
    noDiscussions: "暂无最近讨论。",
    loadDiscussionsFailed: "无法加载讨论",
    replies: "条回复",
    reply: "条回复",
  },
  messages: {
    title: "消息",
    searchConversations: "搜索对话",
    noConversations: "暂无对话",
    noConversationsHint: "访问他人资料并点击「私信」即可开始聊天。",
    browsePeople: "浏览用户",
    noChatsMatch: "没有匹配「{q}」的对话。",
    sayHello: "打个招呼吧！",
    directMessage: "私信",
    backToConversations: "返回对话列表",
    deleteConversation: "删除对话",
    deleteConversationConfirm: "确定删除与 {name} 的对话吗？此操作无法撤销。",
    deleteMessage: "删除消息",
    deleteMessageConfirm: "确定删除这条消息吗？",
    sayHelloTo: "向 {name} 打个招呼",
    conversationStart: "这是你们对话的开始。发一条消息，开启技能交换吧。",
    messagePlaceholder: "给 {name} 发消息…",
  },
  browse: {
    searchPlaceholder: "按姓名或技能搜索…",
    allCategories: "全部分类",
    highestRated: "评分最高",
    mostReviews: "评价最多",
    nameAZ: "姓名（A-Z）",
    loadingPeople: "正在加载用户…",
    loadFailed: "加载用户失败",
    personFound: "找到 {n} 人",
    peopleFound: "找到 {n} 人",
    noMatches: "暂无匹配",
    noMatchesHint: "试试其他关键词或分类。",
    noRatingsYet: "暂无评分",
    noSkillsListed: "未填写技能",
    viewProfile: "查看资料",
  },
  notifications: {
    title: "通知",
    unreadCount: "{n} 条未读",
    allCaughtUp: "全部已读",
    newCount: "{n} 条新通知",
    typeMessage: "消息",
    typeSwapRequest: "交换请求",
    typeSwapUpdate: "交换更新",
    typeLevelUp: "升级",
    typeForum: "论坛",
    typeReview: "评价",
    markAllRead: "全部标为已读",
    empty: "暂无通知",
    emptyHint: "交换请求和消息会出现在这里。",
    viewSwapRequests: "查看交换请求",
  },
  forum: {
    latest: "最新",
    popular: "热门",
    unanswered: "未回复",
    communities: "社区",
    createCommunity: "创建社区",
    manageCommunities: "管理",
    joinFromForum: "在论坛中加入感兴趣的社区。",
    favorite: "收藏",
    unfavorite: "取消收藏",
    createPost: "发帖",
    createPostPlaceholder: "写点什么…",
    postIn: "在 {title} 发帖…",
    create: "创建",
    posts: "篇帖子",
    post: "篇帖子",
    discoverTitle: "发现社区",
    discoverSubtitle: "加入感兴趣的社区，或创建属于你的社区并开始发帖。",
    recommended: "为你推荐",
    moreLike: "更多类似「{category}」",
    showMore: "显示更多（{n}）",
    showLess: "收起",
    noCommunities: "暂无社区",
    noCommunitiesIn: "「{category}」下暂无社区",
    beFirst: "成为第一个创建的人吧。",
    createCommunityIn: "在「{category}」创建社区",
    trendingTopics: "热门话题",
    noTrending: "暂无热门讨论。",
    replies: "条回复",
    reply: "条回复",
    categoriesAria: "社区分类",
    notJoinedYet: "你还没有加入任何社区",
    noFavorites: "暂无收藏的社区",
    noFilterMatch: "没有符合筛选条件的社区",
    discoverCta: "发现社区",
    tryDifferentFilter: "试试其他筛选，或在列表中添加收藏。",
    shareWithCommunity: "与社区分享",
    postingIn: "发布到 {title}",
    community: "社区",
    chooseCommunity: "选择社区",
    titlePlaceholder: "标题",
    detailsPlaceholder: "添加详情（如附带图片则可选）…",
    posting: "发布中…",
    postAction: "发布",
    createWizardAbout: "你的社区是关于什么的？",
    createWizardAboutSub: "最多选择 3 个主题，帮助他人发现你的社区。",
    createWizardDetails: "介绍一下你的社区",
    createWizardDetailsSub: "名称和简介能帮助人们了解你的社区。",
    createWizardStyle: "打造社区风格",
    createWizardStyleSub: "添加图标图片或颜色，让社区更醒目。之后可以更改。",
    createWizardType: "这是什么类型的社区？",
    createWizardTypeSub: "决定谁可以查看和参与。之后可以更改。",
    pickTopicError: "请至少选择一个主题。",
    nameDescError: "请填写名称（3–21 个字符）和简介。",
    chooseImageError: "请选择图片文件。",
    imageTooLarge: "图片过大（最大 10MB）。",
    needSignIn: "你需要先登录。",
    changeImage: "更换图片",
    uploadImage: "上传图片",
    visibilityPublic: "公开",
    visibilityPublicDesc: "任何人都可以查看、发帖和评论。",
    visibilityRestricted: "受限",
    visibilityRestrictedDesc: "任何人都可以查看，但只有获批成员可以发帖。",
    visibilityPrivate: "私密",
    visibilityPrivateDesc: "只有获批成员可以查看和参与。",
    back: "返回",
    next: "下一步",
    creating: "创建中…",
    createCommunityTitle: "创建社区",
    manageTitle: "管理社区",
    manageFilterPlaceholder: "筛选你的社区",
    leaveCommunity: "退出社区",
    allCommunities: "全部社区",
    favoritesTab: "收藏",
  },
  profile: {
    memberSince: "加入于",
    timezone: "时区",
    editProfile: "编辑资料",
    saveProfile: "保存资料",
    changePhoto: "更换头像",
    bioPlaceholder: "向社区介绍一下自己…",
    noBio: "暂无简介。",
    noBioHint: "写一段简短介绍，让社区更了解你。",
    yourName: "你的姓名",
    uploadingPhoto: "正在上传头像…",
    saving: "保存中…",
    skillsTeach: "我能教的技能",
    skillsLearn: "我想学的技能",
    addSkill: "添加技能",
    noneAdded: "尚未添加。",
    searchSkills: "搜索技能…",
    noMatchingSkills: "没有匹配的技能。",
    reviews: "评价",
    noReviews: "暂无评价",
    noReviewsHint: "完成第一次技能交换后，即可收到评价并积累信任分。",
    achievements: "成就",
    unlockedCount: "已解锁 {n} / {total}",
    unlocked: "已解锁",
    levelCard: "等级",
    trustScore: "信任分",
    noRatingsYet: "暂无评分",
    trustNoRatingsHint: "完成第一次交换后即可建立信任分。",
    reviewCountOne: "（{n} 条评价）",
    reviewCountMany: "（{n} 条评价）",
    xpProgress: "{current} / {next} XP",
    xpUntilLevel: "距离等级 {level} 还需 {n} XP",
    tierCommon: "普通",
    tierRare: "稀有",
    tierEpic: "史诗",
    tierLegendary: "传说",
    message: "私信",
    messageUser: "私信 {name}",
    requestSwap: "请求交换",
    sendSwapRequest: "发送交换请求",
    requestSent: "已发送请求",
    sending: "发送中…",
    opening: "打开中…",
    swapRequestSentNotice: "交换请求已发送 — 可在「技能交换请求」中查看进度。",
  },
  swaps: {
    pendingRequests: "待处理请求",
    noPending: "当前没有待处理请求。",
    wantsToSwap: "想交换：{skill}",
    sentRequest: "向你发送了交换请求",
    accept: "接受",
    decline: "拒绝",
    confirm: "确认",
    cancel: "取消",
    sessions: "会话",
    noSessions: "暂无会话。",
    joinSession: "加入会话",
    leaveReview: "留下评价",
    notScheduled: "尚未安排时间",
    skillSwapSession: "技能交换会话",
    recentSessions: "近期与即将开始的会话",
    noSessionsHint: "暂无会话。从他人资料页发送交换请求即可开始。",
    sessionInfo: "会话信息",
    swapPartner: "交换伙伴",
    dateTime: "日期与时间",
    status: "状态",
    actions: "操作",
    markComplete: "标记完成",
    reschedule: "改期",
    reviewed: "已评价",
  },
};

export const DICTIONARIES: Record<AppLocale, Dictionary> = {
  en,
  "zh-CN": zhCN,
  id: idPack,
  ja: jaPack,
  ko: koPack,
};

export function getDictionary(locale: AppLocale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}
