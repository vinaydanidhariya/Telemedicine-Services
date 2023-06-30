import ServerResponse from '../../helpers/server-response';
import OnboardingService from './onboarding-service';

class OnboardingController {
  async getInstance (req, res, next) {
    try {
      const response = await OnboardingService.getInstance(req, res, next);
      ServerResponse.sendOk(res, response);
    } catch (err) {
      next(err);
    }
  }

  async signup (req, res, next) {
    OnboardingService.signup(req, res, next).then((response) => {
      ServerResponse.sendOk(res, response);
    }, error => {
      next(error);
    });
  }

  async signin (req, res, next) {
    OnboardingService.signin(req, res, next).then((response) => {
      ServerResponse.sendOk(res, response);
    }, error => {
      next(error);
    });
  }

  async refreshToken (req, res, next) {
    OnboardingService.refreshToken(req, res, next).then((response) => {
      ServerResponse.sendOk(res, response);
    }, error => {
      next(error);
    });
  }
}

export default new OnboardingController();
