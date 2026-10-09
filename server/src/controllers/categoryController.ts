import type { RequestHandler } from 'express';
import type { IdHandler } from '../types/handlers.js';
import { createCategoryBody, updateCategoryBody } from '@accountant/shared';
import { Category } from '../models/Category.js';
import { Transaction } from '../models/Transaction.js';
import { currentUser } from '../middleware/auth.js';
import { valid } from '../middleware/validate.js';
import { badRequest, forbidden, notFound } from '../lib/HttpError.js';
import { toCategoryDto } from '../lib/serializers.js';

export const getCategories: RequestHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const rows = await Category.find({
      archivedAt: null,
      hiddenFor: { $ne: me._id },
      $or: [{ user: me._id }, { isSystem: true }],
    })
      .sort({ isSystem: -1, isMandatory: -1, name: 1 })
      .lean();

    res.json(rows.map(toCategoryDto));
  } catch (err) {
    next(err);
  }
};

export const createCategory: RequestHandler = async (req, res, next) => {
  try {
    const body = valid<typeof createCategoryBody>(req, 'body');
    const me = currentUser(req);

    const duplicate = await Category.exists({
      user: me._id,
      archivedAt: null,
      name: body.name,
    });
    if (duplicate) throw badRequest('Такая категория уже есть', { name: 'Имя занято' });

    const doc = await Category.create({
      ...body,
      dueDay: body.isMandatory ? (body.dueDay ?? null) : null,
      user: me._id,
      isSystem: false,
    });
    res.status(201).json(toCategoryDto(doc.toObject()));
  } catch (err) {
    next(err);
  }
};

export const updateCategory: IdHandler = async (req, res, next) => {
  try {
    const body = valid<typeof updateCategoryBody>(req, 'body');
    const me = currentUser(req);

    const doc = await Category.findById(req.params.id);
    if (!doc || doc.archivedAt) throw notFound('Категория не найдена.');
    if (doc.isSystem) throw forbidden('Системные категории нельзя изменить.');
    if (!doc.user?.equals(me._id)) throw forbidden('Нет доступа.');

    if (body.name !== undefined) doc.name = body.name;
    if (body.type !== undefined) doc.type = body.type;
    if (body.icon !== undefined) doc.icon = body.icon;
    if (body.ink !== undefined) doc.ink = body.ink;
    if (body.isMandatory !== undefined) doc.isMandatory = body.isMandatory;
    if (body.dueDay !== undefined) doc.dueDay = doc.isMandatory ? (body.dueDay ?? null) : null;

    await doc.save();
    res.json(toCategoryDto(doc.toObject()));
  } catch (err) {
    next(err);
  }
};

export const archiveCategory: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const doc = await Category.findById(req.params.id);
    if (!doc || doc.archivedAt) throw notFound('Категория не найдена.');
    if (doc.isSystem) throw forbidden('Системные категории нельзя удалить — их можно скрыть.');
    if (!doc.user?.equals(me._id)) throw forbidden('Нет доступа.');

    const used = await Transaction.countDocuments({ category: doc._id });

    doc.archivedAt = new Date();
    await doc.save();

    res.json({ archived: true, affectedTransactions: used });
  } catch (err) {
    next(err);
  }
};

export const hideCategory: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    const result = await Category.updateOne(
      { _id: req.params.id, isSystem: true, archivedAt: null },
      { $addToSet: { hiddenFor: me._id } },
    );
    if (result.matchedCount === 0) {
      throw badRequest('Скрыть можно только системную категорию.');
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const unhideCategory: IdHandler = async (req, res, next) => {
  try {
    const me = currentUser(req);
    await Category.updateOne(
      { _id: req.params.id, isSystem: true },
      { $pull: { hiddenFor: me._id } },
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};