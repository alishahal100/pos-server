export const getSubscriptionStatus = (subscription) => {
  const now = new Date();
  const trialValid = subscription?.isTrial && subscription.trialEnd && now <= new Date(subscription.trialEnd);
  const paidValid = subscription?.isPaid && subscription.paidEnd && now <= new Date(subscription.paidEnd);

  if (trialValid) return "trial";
  if (paidValid) return "active";
  return "expired";
};

export const getDaysRemaining = (subscription) => {
  const now = new Date();
  let endDate;

  if (subscription?.isTrial && subscription.trialEnd) {
    endDate = new Date(subscription.trialEnd);
  } else if (subscription?.isPaid && subscription.paidEnd) {
    endDate = new Date(subscription.paidEnd);
  }

  if (!endDate) return 0;

  const diffTime = endDate.getTime() - now.getTime();
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
};
