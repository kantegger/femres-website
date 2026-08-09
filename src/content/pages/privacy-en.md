---
title: "Privacy Policy"
language: "en"
lastUpdated: 2026-07-22
intro: "What FemRes currently collects, what it does not collect, and how you can control your data"
---

## 1. Scope

This policy applies to the FemRes website, accounts, comments, saved works, likes, newsletter, contact, and contribution features. External websites, embedded players, and resources we link to are governed by their own privacy policies.

## 2. Information we process

### 2.1 Accounts and community features

When you register, we store your username, email address, a one-way derived password value, and account creation and update times. An account record may include an avatar URL. We do not store your plain-text password.

Saved works, likes, comments, comment likes, and comment reports are linked to your account. Comments and usernames are public. Report reasons, optional details, and moderation status are used for governance and security.

### 2.2 Newsletter, contact, and contributions

When you subscribe to the newsletter, we store your email address, subscription source, and subscription time until you unsubscribe.

Our contact and contribution forms are processed by Formspree. When you submit one, Formspree receives the name, email, subject, message, or contribution details you enter, together with technical information needed to process the request. Please do not submit unnecessary sensitive personal data, such as health, identity-document, or financial information, through forms or public comments.

### 2.3 Request and device information

To limit abuse of registration, login, comment, report, and subscription endpoints, the FemRes server reads an IP address from request headers and keeps an in-memory counter for no longer than one hour. FemRes does not write that rate-limit record to its database, and it may disappear sooner when a server instance restarts.

Hosting and content-delivery providers may still process IP addresses, timestamps, request paths, browser or device information, security events, and network logs under their own policies. Embedded audio or video sends a request to the relevant platform only when your browser loads that third-party content.

### 2.4 Processing we do not currently perform

FemRes does not currently build profiles of page views or on-site searches, use third-party advertising trackers, sell personal information, or provide behavioral or AI-personalized recommendations. Comment moderation currently relies on user reports, self-service deletion, and human handling, not AI review. If these boundaries change, we will update this policy before enabling the relevant feature.

## 3. Why we use information

We process information only to create and protect accounts; maintain login sessions; provide saved works, likes, comments, and reporting; manage newsletter subscriptions and unsubscribes; answer contact and contribution submissions; prevent abuse, diagnose failures, and secure the service; and meet applicable legal obligations.

## 4. Service providers and transfers

FemRes uses the following infrastructure providers:

* **Vercel** hosts the website and server APIs and processes operational and security logs. See the [Vercel Privacy Notice](https://vercel.com/legal/privacy-notice).
* **Supabase** hosts the FemRes PostgreSQL database. Browsers and client applications do not directly access these internal tables. See the [Supabase Privacy Policy](https://supabase.com/privacy).
* **Cloudflare R2** stores and delivers covers, posters, and other media. See the [Cloudflare Privacy Policy](https://www.cloudflare.com/policies/privacy/).
* **Formspree** receives contact and contribution forms and forwards them to FemRes. See the [Formspree Privacy Policy](https://formspree.io/legal/privacy-policy/).

These services may process data outside your country or region. We disclose information only to providers that need it to deliver the service, or when necessary to comply with law, protect users, or defend legitimate rights. We do not sell or provide personal information to advertisers.

## 5. Cookies and local storage

FemRes uses a necessary login cookie named `femres_auth`, valid for up to seven days and set to HttpOnly and SameSite=Lax; production also uses Secure. The `femres_locale` language cookie lasts up to one year. Browser local storage holds theme and language preferences and local saved/liked state so the interface can be restored; authentication is determined by the secure cookie.

FemRes currently uses no first-party advertising or traffic-analytics cookies. Blocking necessary cookies or clearing local storage may prevent login, language, or theme preferences from persisting.

## 6. Retention and deletion

Account data, saved works, likes, and comments are generally retained until you delete the content or account. After signing in, you can permanently delete your account from your [reader profile](/en/profile). Associated saved works, likes, comments, comment likes, and reports are removed through database relationships, and deletion cannot be undone.

Newsletter addresses are kept until you unsubscribe through the [unsubscribe page](/en/unsubscribe). Contact and contribution records are kept as needed to handle the request, maintain necessary editorial records, or meet legal obligations; you may ask us to delete them. Infrastructure providers may retain security, backup, or compliance records under their own policies.

## 7. Your choices and rights

Depending on applicable law, you may request access to, correction or deletion of, or a copy of personal information we hold, and may object to or restrict particular processing. We may need to verify your identity and may retain limited records where required by law or necessary to protect other people’s rights.

You can change your username, delete your own comments, delete your account, and unsubscribe from email directly. For other requests, email privacy@femres.org.

## 8. Security

FemRes uses HTTPS, protected login cookies, password derivation, same-origin checks on mutations, endpoint rate limits, and database access controls. No internet service can promise absolute security. If you discover a security issue, do not disclose personal data in a public comment; contact us directly.

## 9. Children

FemRes is not directed to children under 13 and does not knowingly collect their personal information. If you believe a child has provided personal information, contact privacy@femres.org so we can verify and take appropriate action.

## 10. Updates and contact

We will update the date and text when our data practices or product features materially change. We will try to announce significant changes on the website or by email, using email only where you have agreed to receive the relevant communication.

Privacy questions and rights requests: privacy@femres.org or [Contact us](/en/contact).
