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
    collapseSidebar: string;
    expandSidebar: string;
    closeMenu: string;
    navigationLabel: string;
    primaryNav: string;
    openNavigationMenu: string;
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
    logOutConfirmTitle: string;
    logOutConfirmDesc: string;
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
    locationApproximate: string;
    locationNone: string;
    locationCountry: string;
    genderMan: string;
    genderWoman: string;
    genderNonBinary: string;
    genderPreferNot: string;
    saveFailed: string;
    updateEmailFailed: string;
    checkInboxToConfirm: string;
    passwordRequirementsNotMet: string;
    passwordsDoNotMatch: string;
    updatePasswordFailed: string;
    passwordUpdated: string;
    closeDialog: string;
    settingsSections: string;
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
    remove: string;
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
    selectConversation: string;
    selectConversationHint: string;
    today: string;
    yesterday: string;
    addEmoji: string;
    send: string;
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
    backToCommunity: string;
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
    trending: string;
    recommended: string;
    recommendedBasedOnSkills: string;
    recommendedNoSkillMatch: string;
    moreLike: string;
    showMore: string;
    showLess: string;
    moreCommunities: string;
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
    communityBanner: string;
    communityBannerSub: string;
    communityIconSub: string;
    changeBanner: string;
    uploadBanner: string;
    removeBanner: string;
    editCommunity: string;
    editCommunityTitle: string;
    editCommunitySub: string;
    communityNameLabel: string;
    communityDescLabel: string;
    changeCommunityIcon: string;
    removeCommunityIcon: string;
    officialCommunity: string;
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
    leaveCommunityConfirmTitle: string;
    leaveCommunityConfirmDesc: string;
    leaveCommunityAsOwner: string;
    allCommunities: string;
    favoritesTab: string;
    trendingIn: string;
    visitCommunity: string;
    morePostsIn: string;
    noPostsYet: string;
    startFeed: string;
    noPostsFor: string;
    deleteCommunity: string;
    deleteCommunityConfirmTitle: string;
    deleteCommunityConfirmDesc: string;
    joinConversation: string;
    joinToComment: string;
    joinToCommentHint: string;
    commentAction: string;
    commentCancel: string;
    sortBy: string;
    sortBest: string;
    sortNew: string;
    sortOld: string;
    searchComments: string;
    noCommentsYet: string;
    noCommentsMatch: string;
    replyAction: string;
    shareAction: string;
    copyLink: string;
    linkCopied: string;
    reportAction: string;
    reportThanks: string;
    reportFailed: string;
    reportAlready: string;
    reportDialogTitle: string;
    reportDialogSubtitle: string;
    reportSelectReason: string;
    reportReasonSpam: string;
    reportReasonHarassment: string;
    reportReasonHate: string;
    reportReasonInappropriate: string;
    reportReasonMisinformation: string;
    reportReasonOther: string;
    reportDetailsLabel: string;
    reportDetailsRequiredLabel: string;
    reportDetailsPlaceholder: string;
    reportDetailsRequired: string;
    reportDetailsRequiredHint: string;
    reportDetailsOptionalHint: string;
    reportSubmit: string;
    reportSubmitting: string;
    opBadge: string;
    topComment: string;
    collapseThread: string;
    expandThread: string;
    commentsCount: string;
    moreActions: string;
  };
  profile: {
    memberSince: string;
    userUid: string;
    copyUid: string;
    uidCopied: string;
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
    memberNotFound: string;
    profileNotFoundHint: string;
    skillsOffered: string;
    skillsWanted: string;
    noBioYet: string;
    saveProfileFailed: string;
    savePhotoFailed: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    usernameHint: string;
    usernameChecking: string;
    usernameAvailable: string;
    usernameTaken: string;
    usernameTooShort: string;
    usernameTooLong: string;
    usernameInvalidChars: string;
    usernameMustStartWithLetter: string;
    usernameReserved: string;
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
    removeFromHistory: string;
    removeFromHistoryConfirm: string;
    statusPending: string;
    statusAccepted: string;
    statusRescheduled: string;
    statusCompleted: string;
    statusDeclined: string;
    statusCancelled: string;
    scheduleMustBeFuture: string;
    scheduleTooFar: string;
  };
  onboarding: {
    skillSaved: string;
    errorBioRequired: string;
    errorUsernameRequired: string;
    errorSubjectRequired: string;
    errorTeachTagsRequired: string;
    errorLearnTagsRequired: string;
    errorSaveFailed: string;
    errorGeneric: string;
    stepLabel: string;
    ofLabel: string;
    teachTitle: string;
    teachDescription: string;
    learnTitle: string;
    learnDescription: string;
    back: string;
    finishing: string;
    finishSetup: string;
    saveContinue: string;
    updateLaterHint: string;
    profileTitle: string;
    profileSubtitle: string;
    profileEditHint: string;
    shortBio: string;
    bioPlaceholder: string;
    timezone: string;
    primarySubjectField: string;
    customSubjectPlaceholder: string;
    selectTagsTitle: string;
    otherSubject: string;
    searchCity: string;
    typeCityName: string;
    noCitiesFound: string;
  };
  swapSession: {
    reviewChooseRating: string;
    rateSession: string;
    howWasSwap: string;
    close: string;
    rating: string;
    review: string;
    reviewPlaceholder: string;
    later: string;
    submitting: string;
    submitReview: string;
    star: string;
    stars: string;
    prevMonth: string;
    nextMonth: string;
    scheduledLegend: string;
    statusJoining: string;
    statusPartnerJoinedConnecting: string;
    statusWaitingPartner: string;
    statusConnectingPeer: string;
    statusConnected: string;
    statusFailed: string;
    statusEnded: string;
    backToRequests: string;
    roomTitle: string;
    withLabel: string;
    live: string;
    partnerInRoom: string;
    enableDevices: string;
    connecting: string;
    waitingForThemToJoin: string;
    requesting: string;
    enableCameraMic: string;
    you: string;
    micOff: string;
    camOff: string;
    enableMic: string;
    muteMic: string;
    unmuteMic: string;
    mute: string;
    unmute: string;
    enableCamera: string;
    turnCameraOff: string;
    turnCameraOn: string;
    cameraOff: string;
    cameraOn: string;
    leave: string;
    finishingUp: string;
    markComplete: string;
    defaultTopic: string;
    sessionChatTitle: string;
    messageWhileSwap: string;
    noMessagesYet: string;
    download: string;
    typeMessage: string;
    attachFile: string;
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
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    closeMenu: "Close menu",
    navigationLabel: "Navigation",
    primaryNav: "Primary",
    openNavigationMenu: "Open navigation menu",
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
    logOutConfirmTitle: "Log out?",
    logOutConfirmDesc: "Are you sure you want to end your session on this device?",
    password: "Password",
    passwordDesc: "Change the password you use to sign in.",
    passwordGoogle:
      "You signed in with Google. You can still set a SkillBridge password to sign in with email.",
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
    locationApproximate: "Use approximate location",
    locationNone: "No location specified",
    locationCountry: "Country",
    genderMan: "Man",
    genderWoman: "Woman",
    genderNonBinary: "Non-binary",
    genderPreferNot: "Prefer not to say",
    saveFailed: "Failed to save settings.",
    updateEmailFailed: "Failed to update email.",
    checkInboxToConfirm: "Check your inbox to confirm the new email address.",
    passwordRequirementsNotMet: "New password does not meet the requirements.",
    passwordsDoNotMatch: "Passwords do not match.",
    updatePasswordFailed: "Failed to update password.",
    passwordUpdated: "Password updated.",
    closeDialog: "Close dialog",
    settingsSections: "Settings sections",
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
    remove: "Remove",
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
    selectConversation: "Select a conversation",
    selectConversationHint: "Pick someone from the left to keep chatting, or find a new partner to message.",
    today: "Today",
    yesterday: "Yesterday",
    addEmoji: "Add emoji",
    send: "Send message",
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
    backToCommunity: "Back to {community}",
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
    trending: "Trending",
    recommended: "Recommended for you",
    recommendedBasedOnSkills: "Based on skills you want to learn: {skills}",
    recommendedNoSkillMatch:
      "We couldn't find a close match yet — showing active communities. Try adding more skills on your profile.",
    moreLike: "More like {category}",
    showMore: "Show more",
    showLess: "Show less",
    moreCommunities: "More Communities",
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
    communityBanner: "Community banner",
    communityBannerSub: "Upload a wide banner (5:1 recommended, e.g. 1920×384). Shown on discovery cards and your community page.",
    communityIconSub: "Upload a square icon, or use a letter with an accent color.",
    changeBanner: "Change banner",
    uploadBanner: "Upload banner",
    removeBanner: "Remove banner",
    editCommunity: "Edit community",
    editCommunityTitle: "Edit community",
    editCommunitySub: "Update your community name, description, banner, and icon.",
    communityNameLabel: "Community name",
    communityDescLabel: "Description",
    changeCommunityIcon: "Change community icon",
    removeCommunityIcon: "Remove icon",
    officialCommunity: "Official community",
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
    leaveCommunityConfirmTitle: "Leave this community?",
    leaveCommunityConfirmDesc: "You can join again later from Discover or the community page.",
    leaveCommunityAsOwner: "You created this community — delete it from the community page if you want it gone.",
    allCommunities: "All Communities",
    favoritesTab: "Favorites",
    trendingIn: "Trending in {title}",
    visitCommunity: "Visit community",
    morePostsIn: "More in {title}",
    noPostsYet: "This community doesn't have any posts yet",
    startFeed: "Make one and get this feed started.",
    noPostsFor: 'No posts found for "{q}"',
    deleteCommunity: "Delete community",
    deleteCommunityConfirmTitle: "Delete this community?",
    deleteCommunityConfirmDesc:
      "Delete r/{slug}? Posts will move to General. This can't be undone.",
    joinConversation: "Join the conversation",
    joinToComment: "Join the community to participate",
    joinToCommentHint: "You need to be a member before you can post, comment, or vote in this community.",
    commentAction: "Comment",
    commentCancel: "Cancel",
    sortBy: "Sort by",
    sortBest: "Best",
    sortNew: "New",
    sortOld: "Old",
    searchComments: "Search comments",
    noCommentsYet: "No replies yet — be the first to comment.",
    noCommentsMatch: "No comments match your search.",
    replyAction: "Reply",
    shareAction: "Share",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    reportAction: "Report",
    reportThanks: "Thanks — we'll review this report.",
    reportFailed: "Couldn't submit the report.",
    reportAlready: "You already reported this.",
    reportDialogTitle: "Report content",
    reportDialogSubtitle: "Choose a reason and optionally add details. Reports go to moderators.",
    reportSelectReason: "Reason for report",
    reportReasonSpam: "Spam or advertising",
    reportReasonHarassment: "Harassment or bullying",
    reportReasonHate: "Hate speech",
    reportReasonInappropriate: "Inappropriate content",
    reportReasonMisinformation: "Misinformation",
    reportReasonOther: "Other",
    reportDetailsLabel: "Additional details (optional)",
    reportDetailsRequiredLabel: "Describe the violation",
    reportDetailsPlaceholder: "Explain what happened or why this violates community rules…",
    reportDetailsRequired: "Please describe the violation (at least 5 characters).",
    reportDetailsRequiredHint: "Required when choosing Other — at least 5 characters.",
    reportDetailsOptionalHint: "Optional — helps moderators review faster.",
    reportSubmit: "Submit report",
    reportSubmitting: "Submitting…",
    opBadge: "OP",
    topComment: "Top comment",
    collapseThread: "Collapse thread",
    expandThread: "Expand thread",
    commentsCount: "{n} comments",
    moreActions: "More actions",
  },
  profile: {
    memberSince: "Member since",
    userUid: "UID: {uid}",
    copyUid: "Copy UID",
    uidCopied: "Copied",
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
    memberNotFound: "Member not found",
    profileNotFoundHint: "This profile doesn't exist or may have been removed.",
    skillsOffered: "Skills Offered",
    skillsWanted: "Skills Wanted",
    noBioYet: "This user hasn't added a bio yet.",
    saveProfileFailed: "Failed to save profile. Please try again.",
    savePhotoFailed: "Failed to save photo. Please try again.",
    usernameLabel: "Username",
    usernamePlaceholder: "your-name",
    usernameHint: "3–30 characters. Letters, numbers, and hyphens. Must start with a letter.",
    usernameChecking: "Checking availability…",
    usernameAvailable: "This username is available.",
    usernameTaken: "This username is already taken.",
    usernameTooShort: "Username must be at least 3 characters.",
    usernameTooLong: "Username must be 30 characters or fewer.",
    usernameInvalidChars: "Use only letters, numbers, and single hyphens.",
    usernameMustStartWithLetter: "Username must start with a letter.",
    usernameReserved: "This username is reserved.",
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
    removeFromHistory: "Remove from history",
    removeFromHistoryConfirm:
      "Remove this session from your list? Your partner will still see it in their history.",
    statusPending: "Pending",
    statusAccepted: "Accepted",
    statusRescheduled: "Rescheduled",
    statusCompleted: "Completed",
    statusDeclined: "Declined",
    statusCancelled: "Cancelled",
    scheduleMustBeFuture: "Choose the current time or a later date and time.",
    scheduleTooFar: "Sessions can only be scheduled up to 4 weeks ahead.",
  },
  onboarding: {
    skillSaved: "Skill saved",
    errorBioRequired: "Please write a short bio before continuing.",
    errorUsernameRequired: "Choose an available username before continuing.",
    errorSubjectRequired: "Please tell us your subject field.",
    errorTeachTagsRequired: "Please select at least one skill you can teach.",
    errorLearnTagsRequired: "Please select at least one skill you want to learn.",
    errorSaveFailed: "Failed to save onboarding. Please try again.",
    errorGeneric: "Something went wrong. Please try again.",
    stepLabel: "Step",
    ofLabel: "of",
    teachTitle: "What skills can you share?",
    teachDescription: "Select subjects you feel comfortable teaching to other community peers.",
    learnTitle: "What skills do you want to learn?",
    learnDescription: "Choose the skills you're looking to learn from the community.",
    back: "Back",
    finishing: "Finishing...",
    finishSetup: "Finish Setup",
    saveContinue: "Save & Continue",
    updateLaterHint: "You can always update this later.",
    profileTitle: "Let's build your profile",
    profileSubtitle: "Tell the community a little about yourself.",
    profileEditHint: "You can always edit this later.",
    shortBio: "Short Bio",
    bioPlaceholder: "Share a bit about yourself, your background, and what you enjoy...",
    timezone: "Timezone",
    primarySubjectField: "Primary Subject Field",
    customSubjectPlaceholder: "Tell us your subject field",
    selectTagsTitle: "Select Tags to Feature on Your Profile",
    otherSubject: "Other",
    searchCity: "Search your city...",
    typeCityName: "Type a city name...",
    noCitiesFound: "No cities found.",
  },
  swapSession: {
    reviewChooseRating: "Please choose a star rating.",
    rateSession: "Rate your session",
    howWasSwap: "How was your skill swap with {name}?",
    close: "Close",
    rating: "Rating",
    review: "Review",
    reviewPlaceholder: "Share what went well or what could improve…",
    later: "Later",
    submitting: "Submitting…",
    submitReview: "Submit review",
    star: "{n} star",
    stars: "{n} stars",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    scheduledLegend: "Skill swap session scheduled",
    statusJoining: "Joining session room…",
    statusPartnerJoinedConnecting: "Partner joined — connecting…",
    statusWaitingPartner: "Waiting for your partner to join…",
    statusConnectingPeer: "Connecting to your partner…",
    statusConnected: "Connected — you are live",
    statusFailed: "Connection failed. Ask your partner to rejoin, or try again.",
    statusEnded: "Call ended",
    backToRequests: "Back to requests",
    roomTitle: "Skill Swap Session",
    withLabel: "with",
    live: "Live",
    partnerInRoom: "Partner in room",
    enableDevices: "Enable devices",
    connecting: "Connecting…",
    waitingForThemToJoin: "Waiting for them to join.",
    requesting: "Requesting…",
    enableCameraMic: "Enable camera & mic",
    you: "You",
    micOff: "Mic off",
    camOff: "Cam off",
    enableMic: "Enable microphone",
    muteMic: "Mute microphone",
    unmuteMic: "Unmute microphone",
    mute: "Mute",
    unmute: "Unmute",
    enableCamera: "Enable camera",
    turnCameraOff: "Turn camera off",
    turnCameraOn: "Turn camera on",
    cameraOff: "Camera off",
    cameraOn: "Camera on",
    leave: "Leave",
    finishingUp: "Finishing…",
    markComplete: "Mark Complete",
    defaultTopic: "Skill swap",
    sessionChatTitle: "Session chat",
    messageWhileSwap: "Message {name} while you swap",
    noMessagesYet: "No messages yet. Say hi, send a file, or drop an emoji.",
    download: "Download",
    typeMessage: "Type a message…",
    attachFile: "Attach file",
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
    collapseSidebar: "收起侧边栏",
    expandSidebar: "展开侧边栏",
    closeMenu: "关闭菜单",
    navigationLabel: "导航",
    primaryNav: "主导航",
    openNavigationMenu: "打开导航菜单",
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
    logOutConfirmTitle: "确认退出？",
    logOutConfirmDesc: "确定要结束此设备上的当前会话吗？",
    password: "密码",
    passwordDesc: "更改用于登录的密码。",
    passwordGoogle: "你使用 Google 登录。仍可设置 SkillBridge 密码，以便用邮箱登录。",
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
    locationApproximate: "使用大致位置",
    locationNone: "不指定位置",
    locationCountry: "国家/地区",
    genderMan: "男",
    genderWoman: "女",
    genderNonBinary: "非二元",
    genderPreferNot: "不愿透露",
    saveFailed: "保存设置失败。",
    updateEmailFailed: "更新邮箱失败。",
    checkInboxToConfirm: "请查收邮箱以确认新邮箱地址。",
    passwordRequirementsNotMet: "新密码不符合要求。",
    passwordsDoNotMatch: "两次输入的密码不一致。",
    updatePasswordFailed: "更新密码失败。",
    passwordUpdated: "密码已更新。",
    closeDialog: "关闭对话框",
    settingsSections: "设置分区",
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
    remove: "移除",
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
    selectConversation: "选择一个对话",
    selectConversationHint: "从左侧选择联系人继续聊天，或去浏览用户开始新对话。",
    today: "今天",
    yesterday: "昨天",
    addEmoji: "添加表情",
    send: "发送消息",
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
    backToCommunity: "返回 {community}",
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
    trending: "热门",
    recommended: "为你推荐",
    recommendedBasedOnSkills: "根据你想学的技能推荐：{skills}",
    recommendedNoSkillMatch: "暂未找到高度匹配的社区，以下为活跃社区。可在个人资料中添加更多技能。",
    moreLike: "更多类似「{category}」",
    showMore: "显示更多",
    showLess: "收起",
    moreCommunities: "更多社区",
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
    communityBanner: "社区横幅",
    communityBannerSub: "上传宽幅横幅（建议 5:1，如 1920×384），将显示在发现页卡片和社区主页。",
    communityIconSub: "上传方形图标，或使用字母 + 主题色。",
    changeBanner: "更换横幅",
    uploadBanner: "上传横幅",
    removeBanner: "移除横幅",
    editCommunity: "编辑社区",
    editCommunityTitle: "编辑社区",
    editCommunitySub: "修改社区名称、简介、横幅和图标。",
    communityNameLabel: "社区名称",
    communityDescLabel: "简介",
    changeCommunityIcon: "更换社区图标",
    removeCommunityIcon: "移除图标",
    officialCommunity: "官方社区",
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
    leaveCommunityConfirmTitle: "退出该社区？",
    leaveCommunityConfirmDesc: "之后仍可从发现页或社区页重新加入。",
    leaveCommunityAsOwner: "这是你创建的社区 — 如需移除，请在社区页删除。",
    allCommunities: "全部社区",
    favoritesTab: "收藏",
    trendingIn: "{title} 中的热门",
    visitCommunity: "访问社区",
    morePostsIn: "{title} 中的更多帖子",
    noPostsYet: "这个社区还没有帖子",
    startFeed: "发一篇，开启讨论吧。",
    noPostsFor: "没有找到与「{q}」相关的帖子",
    deleteCommunity: "删除社区",
    deleteCommunityConfirmTitle: "删除该社区？",
    deleteCommunityConfirmDesc: "删除 r/{slug}？帖子将移至 General，此操作无法撤销。",
    joinConversation: "参与讨论",
    joinToComment: "加入社区后才能参与讨论",
    joinToCommentHint: "你需要先加入该社区，才能发帖、评论或投票。",
    commentAction: "评论",
    commentCancel: "取消",
    sortBy: "排序",
    sortBest: "最佳",
    sortNew: "最新",
    sortOld: "最早",
    searchComments: "搜索评论",
    noCommentsYet: "还没有回复 — 来做第一个评论的人吧。",
    noCommentsMatch: "没有匹配的评论。",
    replyAction: "回复",
    shareAction: "分享",
    copyLink: "复制链接",
    linkCopied: "链接已复制",
    reportAction: "举报",
    reportThanks: "已提交，我们会尽快审核。",
    reportFailed: "举报提交失败。",
    reportAlready: "你已经举报过该内容了。",
    reportDialogTitle: "举报内容",
    reportDialogSubtitle: "请选择违规类型，并可补充说明。举报将发送给管理员审核。",
    reportSelectReason: "举报原因",
    reportReasonSpam: "垃圾信息或广告",
    reportReasonHarassment: "骚扰或霸凌",
    reportReasonHate: "仇恨言论",
    reportReasonInappropriate: "不当内容",
    reportReasonMisinformation: "虚假信息",
    reportReasonOther: "其他",
    reportDetailsLabel: "补充说明（可选）",
    reportDetailsRequiredLabel: "请描述违规行为",
    reportDetailsPlaceholder: "说明发生了什么，或为何违反社区规则…",
    reportDetailsRequired: "请描述违规行为（至少 5 个字符）。",
    reportDetailsRequiredHint: "选择「其他」时必填，至少 5 个字符。",
    reportDetailsOptionalHint: "可选填写，有助于管理员更快处理。",
    reportSubmit: "提交举报",
    reportSubmitting: "提交中…",
    opBadge: "楼主",
    topComment: "热门评论",
    collapseThread: "折叠线程",
    expandThread: "展开线程",
    commentsCount: "{n} 条评论",
    moreActions: "更多操作",
  },
  profile: {
    memberSince: "加入于",
    userUid: "UID：{uid}",
    copyUid: "复制 UID",
    uidCopied: "已复制",
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
    memberNotFound: "未找到该成员",
    profileNotFoundHint: "该资料不存在，或可能已被删除。",
    skillsOffered: "可提供的技能",
    skillsWanted: "想学习的技能",
    noBioYet: "该用户还没有添加简介。",
    saveProfileFailed: "保存资料失败，请重试。",
    savePhotoFailed: "保存头像失败，请重试。",
    usernameLabel: "用户名",
    usernamePlaceholder: "your-name",
    usernameHint: "3–30 个字符，可使用字母、数字和连字符，且必须以字母开头。",
    usernameChecking: "正在检查是否可用…",
    usernameAvailable: "该用户名可用。",
    usernameTaken: "该用户名已被占用。",
    usernameTooShort: "用户名至少需要 3 个字符。",
    usernameTooLong: "用户名不能超过 30 个字符。",
    usernameInvalidChars: "只能使用字母、数字和单个连字符。",
    usernameMustStartWithLetter: "用户名必须以字母开头。",
    usernameReserved: "该用户名为系统保留，无法使用。",
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
    removeFromHistory: "从历史记录中删除",
    removeFromHistoryConfirm: "从你的列表中移除这条会话？对方仍会在自己的历史记录中看到。",
    statusPending: "待处理",
    statusAccepted: "已接受",
    statusRescheduled: "已改期",
    statusCompleted: "已完成",
    statusDeclined: "已拒绝",
    statusCancelled: "已取消",
    scheduleMustBeFuture: "请选择当前或更晚的日期和时间。",
    scheduleTooFar: "预订时间不能超过 4 周。",
  },
  onboarding: {
    skillSaved: "技能已保存",
    errorBioRequired: "请先填写一段简短的个人简介再继续。",
    errorUsernameRequired: "请先选择一个可用的用户名再继续。",
    errorSubjectRequired: "请告诉我们你的专业领域。",
    errorTeachTagsRequired: "请至少选择一项你能教的技能。",
    errorLearnTagsRequired: "请至少选择一项你想学的技能。",
    errorSaveFailed: "保存新手引导信息失败，请重试。",
    errorGeneric: "出了点问题，请重试。",
    stepLabel: "步骤",
    ofLabel: "之",
    teachTitle: "你能分享哪些技能？",
    teachDescription: "选择你觉得可以教给其他社区成员的主题。",
    learnTitle: "你想学习哪些技能？",
    learnDescription: "选择你希望从社区中学习的技能。",
    back: "上一步",
    finishing: "正在完成...",
    finishSetup: "完成设置",
    saveContinue: "保存并继续",
    updateLaterHint: "你之后随时可以更新这些信息。",
    profileTitle: "让我们来完善你的资料",
    profileSubtitle: "向社区简单介绍一下自己。",
    profileEditHint: "你之后随时可以编辑这些信息。",
    shortBio: "简短简介",
    bioPlaceholder: "分享一些关于你自己、你的背景，以及你喜欢做的事情...",
    timezone: "时区",
    primarySubjectField: "主要专业领域",
    customSubjectPlaceholder: "告诉我们你的专业领域",
    selectTagsTitle: "选择要展示在你资料页上的标签",
    otherSubject: "其他",
    searchCity: "搜索你所在的城市...",
    typeCityName: "输入城市名称...",
    noCitiesFound: "未找到城市。",
  },
  swapSession: {
    reviewChooseRating: "请选择星级评分。",
    rateSession: "为本次交流评分",
    howWasSwap: "你与 {name} 的技能交换体验如何？",
    close: "关闭",
    rating: "评分",
    review: "评价",
    reviewPlaceholder: "分享一下哪些地方做得好，哪些可以改进…",
    later: "稍后再说",
    submitting: "提交中…",
    submitReview: "提交评价",
    star: "{n} 星",
    stars: "{n} 星",
    prevMonth: "上个月",
    nextMonth: "下个月",
    scheduledLegend: "已安排的技能交换会话",
    statusJoining: "正在加入会话房间…",
    statusPartnerJoinedConnecting: "对方已加入 — 正在连接…",
    statusWaitingPartner: "等待对方加入…",
    statusConnectingPeer: "正在连接对方…",
    statusConnected: "已连接 — 你正在实时通话中",
    statusFailed: "连接失败。请让对方重新加入，或再试一次。",
    statusEnded: "通话已结束",
    backToRequests: "返回请求列表",
    roomTitle: "技能交换会话",
    withLabel: "与",
    live: "直播中",
    partnerInRoom: "对方已在房间中",
    enableDevices: "启用设备",
    connecting: "连接中…",
    waitingForThemToJoin: "等待对方加入。",
    requesting: "请求中…",
    enableCameraMic: "启用摄像头和麦克风",
    you: "你",
    micOff: "麦克风已关闭",
    camOff: "摄像头已关闭",
    enableMic: "启用麦克风",
    muteMic: "静音麦克风",
    unmuteMic: "取消静音麦克风",
    mute: "静音",
    unmute: "取消静音",
    enableCamera: "启用摄像头",
    turnCameraOff: "关闭摄像头",
    turnCameraOn: "打开摄像头",
    cameraOff: "摄像头已关闭",
    cameraOn: "摄像头已开启",
    leave: "离开",
    finishingUp: "正在完成…",
    markComplete: "标记完成",
    defaultTopic: "技能交换",
    sessionChatTitle: "会话聊天",
    messageWhileSwap: "在交流过程中给 {name} 发消息",
    noMessagesYet: "暂无消息。打个招呼、发个文件，或者发个表情吧。",
    download: "下载",
    typeMessage: "输入消息…",
    attachFile: "添加附件",
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