class CalendarLinks {
  static getGoogle(): string {
    const url = new URL('https://calendar.google.com/calendar/event');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('tmeid', 'MjBjc3ZpMXE4OXRsdjIwYzM2MzluaGc2MWEgZGF2eS52b25nQG0');
    url.searchParams.set('tmsrc', 'davy.vong@gmail.com');
    return url.href;
  }

  static getICS(): string {
    return '/davy-and-vivian-wedding.ics';
  }

  static getOutlook(): string {
    const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    url.searchParams.set('allday', 'true');
    url.searchParams.set('body', 'http://wedding.davyvong.com/');
    url.searchParams.set('enddt', '2023-06-23');
    url.searchParams.set(
      'location',
      'Willow Springs Winery, 5572 Bethesda Rd, Whitchurch-Stouffville, ON L4A 3A2, Canada',
    );
    url.searchParams.set('path', '/calendar/action/compose');
    url.searchParams.set('rru', 'addevent');
    url.searchParams.set('startdt', '2023-06-23');
    url.searchParams.set('subject', "Davy & Vivian's Wedding");
    return url.href;
  }
}

export default CalendarLinks;
