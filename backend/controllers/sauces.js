const Sauces = require("../models/Sauces");
const fs = require("fs");

//  récupérer toutes les sauces
exports.getAllSauce = async (req, res, next) => {
  try {
    const sauces = await Sauces.find();
    res.status(200).json(sauces);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// récupérer une sauce par son ID
exports.getOneSauce = async (req, res, next) => {
  try {
    const sauce = await Sauces.findOne({ _id: req.params.id });
    res.status(200).json(sauce);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// créer une nouvelle sauce
exports.createSauce = async (req, res, next) => {
  try {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauceCreate = new Sauces({
      ...sauceObject,
      likes: 0,
      dislikes: 0,
      usersDisliked: [],
      usersLiked: [],
      imageUrl: `${req.protocol}://${req.get("host")}/public/images/${
        req.file.filename
      }`,
    });
    await sauceCreate.save();
    res.status(201).json({ message: "sauce enregistrée !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// supprimer une sauce

exports.deleteSauce = async (req, res, next) => {
  try {
    const sauceDelete = await Sauces.findOne({ _id: req.params.id });
    if (sauceDelete.userId != req.auth.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const filename = sauceDelete.imageUrl.split("/public/images/")[1];
    fs.unlink(`./public/images/${filename}`, () => {
      Sauces.deleteOne({ _id: req.params.id })
        .then(() => {
          res.status(200).json({ message: "Objet supprimé !" });
        })
        .catch((error) => res.status(401).json({ error }));
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Modifier une sauce

exports.updateSauce = async (req, res, next) => {
  try {
    const sauceObject = req.file
      ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get("host")}/public/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };

    delete sauceObject._userId;

    const sauceUpdate = await Sauces.findOne({ _id: req.params.id });
    if (sauceUpdate.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.file) {
      const filename = sauceUpdate.imageUrl.split("/public/images/")[1];
      fs.unlink(`./public/images/${filename}`, async () => {
        await Sauces.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        );
        return res.status(200).json({ message: "Sauce modifiée !" });
      });
    } else {
      await Sauces.updateOne(
        { _id: req.params.id },
        { ...sauceObject, _id: req.params.id }
      );
      return res.status(200).json({ message: "Sauce modifiée !" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

// like / dislike system

exports.likeOrDislike = async (req, res) => {
  try {
    const sauce = await Sauces.findOne({ _id: req.params.id });
    const userVoteLike = sauce.usersLiked.includes(req.body.userId);
    const userVoteDislike = sauce.usersDisliked.includes(req.body.userId);

    // Vérification si c'est un nombre
    if (isNaN(req.body.like)) {
      res
        .status(400)
        .json({ message: "La valeur du like doit être un nombre" });
      return;
    }

    // Annuler son vote
    if (req.body.like === 0) {
      if (userVoteLike) {
        await Sauces.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { usersLiked: req.body.userId },
          }
        );
        return res.status(200).json({ message: "Vous avez annulé votre like" });
      }
      if (userVoteDislike) {
        await Sauces.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: req.body.userId },
          }
        );
        return res
          .status(200)
          .json({ message: "Vous avez annulé votre dislike" });
      }
      return res.status(400).json({ message: "Vous n'avez pas encore voté" });
    }

    // L'utilisateur like
    if (!userVoteLike && req.body.like === 1) {
      await Sauces.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
          $push: { usersLiked: req.body.userId },
        }
      );
      return res.status(200).json({ message: "Vous avez ajouté 1 like" });
    }

    // L'utilisateur dislike
    if (!userVoteDislike && req.body.like === -1) {
      await Sauces.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: 1 },
          $push: { usersDisliked: req.body.userId },
        }
      );
      return res.status(200).json({ message: "Vous n'aimez pas cette sauce" });
    }

    // L'utilisateur a déjà voté
    return res.status(400).json({ message: "Vous avez déjà voté" });
  } catch (error) {
    return res.status(400).json({ error });
  }
};
