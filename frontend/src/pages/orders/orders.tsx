import { Button } from '~/libs/components/components.js';
import { AppRoute } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect,
  useNavigate,
} from '~/libs/hooks/hooks.js';
import { actions as driverActions } from '~/slices/driver/driver.js';
import { ShiftStatus } from '~/slices/driver/libs/enums/enums.js';
import {
  selectActiveTruck,
  selectShiftStatus,
} from '~/slices/driver/selectors.js';

const Orders: React.FC = () => {
  const dispatch = useAppDispatch();
  const truck = useAppSelector(selectActiveTruck);
  const shiftStatus = useAppSelector(selectShiftStatus);
  const navigate = useNavigate();
  useEffect(() => {
    if (shiftStatus === ShiftStatus.DISABLED) {
      navigate(AppRoute.AVAILABLE_TRUCKS);
    }
  }, [shiftStatus, navigate]);
  const handleClick = useCallback(() => {
    void dispatch(driverActions.endShift());
  }, [dispatch]);

  return (
    <div>
      <p>
        Your chosen truck: {truck?.manufacturer} ({truck?.id}) Test
      </p>
      <Button label={'End shift'} frontIcon={'truck'} onClick={handleClick} />
    </div>
  );
};

export { Orders };
