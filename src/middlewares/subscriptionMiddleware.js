const checkSubscription = (req, res, next) => {
  const { subscription } = req.user;
  const now = new Date();

  const trialValid = subscription?.isTrial && now <= new Date(subscription.trialEnd);
  const paidValid = subscription?.isPaid && now <= new Date(subscription.paidEnd);

  if (trialValid || paidValid) return next();

  return res.status(403).json({
    message: "Your subscription has expired. Please contact support to renew."
  });
};

export default checkSubscription;
