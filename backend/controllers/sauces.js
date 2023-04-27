const Sauces = require ('../models/Sauces');

// controller récupérer toutes les sauces
exports.getAllSauce = async (req, res, next) => {
    try {
      const sauces = await Sauces.find();
      res.status(200).json(sauces);
    } catch (error) {
      res.status(400).json({ error });
    }
  };

//controller récupérer une sauce
exports.getOneSauce = async (req, res, next) => {
  try {
    const sauce = await Sauces.findOne({_id: req.params.id});
    res.status(200).json(sauce);
  } catch (error) {
    res.statut(400).json({error});
  }

};

//controller créer une nouvelle sauce
exports.createSauce = async (req, res, next) => {
  try {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id
    const sauceCreate = new Sauces({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/public/images/${req.file.filename}`
    });
    await sauceCreate.save();
    res.status(201).json({ message: 'sauce enregistrée !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

//controller supprimer une sauce
exports.deleteSauce = async (req, res, next) => {
  try {
    await Sauces.deleteOne({_id: req.params.id })
    res.status(200).json({ message: 'sauce supprimée !'})
  } catch (error) {
    res.status(400).json({ error });
  }
};

//controller modifier une sauce
exports.updateSauce = async (req, res, next) => {
  try {
    const sauceObject = req.file
      ? {
          ...JSON.parse(req.body.thing),
          imageUrl: `${req.protocol}://${req.get("host")}/public/images/${req.file.filename}`,
        }
      : { ...req.body };

    delete sauceObject._userId;

    const sauceUpdate = await Sauces.findOne({ _id: req.params.id });
    if (sauceUpdate.userId != req.auth.userId) {
      res.status(401).json({ message: "Not authorized" });
    } else {
      await Sauces.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
      );
      res.status(200).json({ message: "sauce modifiée!" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};