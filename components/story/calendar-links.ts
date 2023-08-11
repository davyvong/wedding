class CalendarLinks {
  static getGoogle(): string {
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('dates', '20240623/20240623');
    url.searchParams.set('details', 'https://vivian-and-davy.com/');
    url.searchParams.set('location', '');
    url.searchParams.set('text', "Save The Date: Vivian & Davy's Wedding");
    return url.href;
  }

  static getOutlook(): string {
    // https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs/discussions/47
    const url = new URL('https://outlook.live.com/calendar/action/compose');
    url.searchParams.set('allday', 'true');
    url.searchParams.set('body', 'https://vivian-and-davy.com/');
    url.searchParams.set('location', '');
    url.searchParams.set('path', '/calendar/action/compose');
    url.searchParams.set('rru', 'addevent');
    url.searchParams.set('startdt', '2024-06-23');
    url.searchParams.set('subject', "Save The Date: Vivian and Davy's Wedding");
    return url.href;
  }
}

export default CalendarLinks;
