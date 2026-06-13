import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [{ user: req.user._id }, { isSystem: true }],
    });

    console.log('Categories found:', categories.length);

    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color, isMandatory } = req.body;

    if (!name)
      return res.status(400).json({ message: 'Название обязательно.' });

    const category = await Category.create({
      user: req.user._id,
      name,
      type: type || 'both',
      icon: icon || '💰',
      color: color || '#6366f1',
      isMandatory: isMandatory || false,
      isSystem: false,
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: 'Категория не найдена.' });

    if (category.isSystem)
      return res.status(403).json({ message: 'Системные категории нельзя изменить.' });

    if (category.user?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Нет доступа.' });

    const { name, type, icon, color, isMandatory } = req.body;
    if (name) category.name = name;
    if (type) category.type = type;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (isMandatory !== undefined) category.isMandatory = isMandatory;

    await category.save();
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: 'Категория не найдена.' });

    if (category.isSystem)
      return res.status(403).json({ message: 'Системные категории нельзя удалить.' });

    if (category.user?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Нет доступа.' });

    await category.deleteOne();
    res.json({ message: 'Категория удалена.' });
  } catch (err) {
    next(err);
  }
};