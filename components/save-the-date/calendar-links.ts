class CalendarLinks {
  static getGoogle(): string {
    const url = new URL('https://calendar.google.com/calendar/event');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('tmeid', 'MjBjc3ZpMXE4OXRsdjIwYzM2MzluaGc2MWEgZGF2eS52b25nQG0');
    url.searchParams.set('tmsrc', 'host@vivian-and-davy.com');
    return url.href;
  }

  static getOutlook(): string {
    const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    url.searchParams.set('allday', 'true');
    url.searchParams.set('body', 'https://vivian-and-davy.com/');
    url.searchParams.set('enddt', '2023-06-23');
    url.searchParams.set(
      'location',
      'Willow Springs Winery, 5572 Bethesda Rd, Whitchurch-Stouffville, ON L4A 3A2, Canada',
    );
    url.searchParams.set('path', '/calendar/action/compose');
    url.searchParams.set('rru', 'addevent');
    url.searchParams.set('startdt', '2023-06-23');
    url.searchParams.set('subject', "Vivian & Davy's Wedding");
    return url.href;
  }
}

export default CalendarLinks;
