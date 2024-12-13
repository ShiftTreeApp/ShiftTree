# Release Documents for ShiftTree

## Changelog since 04 Dec 2024

[**Scheduler fixes**](https://github.com/ShiftTreeApp/ShiftTree/pull/238)

- Fixed shift spacing issue
- Changed the way that weights are normalized so that the minimum requested weight
  is at least as much as the weight when no preference is selected

**CSV export fix**

- Export CSVs with the times in the client's timezone instead of in UTC (or whatever the timezone of the VPS is).
