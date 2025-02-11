export const checkProfileCompletion = (user) => {
    return Boolean(
        user.fullName &&
        user.height &&
        user.weight &&
        user.contactNumber &&
        user.location &&
        user.trainingExperience
    );
};