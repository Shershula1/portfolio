import assert from "node:assert/strict";
import test from "node:test";
import { isCertificateSection, stampDate, titleFromFileName } from "./certificates";

test("stampDate uses the calendar day of the given date", () => {
  const stamped = stampDate(new Date(2026, 9, 26, 15, 4));
  assert.equal(stamped.date, "26.10.2026");
  assert.equal(stamped.dateTime, "2026-10-26");
});

test("isCertificateSection accepts only the six portfolio sections", () => {
  assert.equal(isCertificateSection("scratch"), true);
  assert.equal(isCertificateSection("karate"), true);
  assert.equal(isCertificateSection("Scrach"), false);
  assert.equal(isCertificateSection(""), false);
});

test("titleFromFileName drops the extension", () => {
  assert.equal(titleFromFileName("Олимпиада.pdf"), "Олимпиада");
  assert.equal(titleFromFileName("  грамота.png  "), "грамота");
  assert.equal(titleFromFileName(".pdf"), "Грамота");
});
