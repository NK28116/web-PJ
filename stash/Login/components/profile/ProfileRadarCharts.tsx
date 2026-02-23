import { mockRadarChartData } from '@/src/const/mockUser';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

const mockData = mockRadarChartData.datasets[0].data.map((value, index) => {
  return {
    A: value,
    subject: mockRadarChartData.labels[index],
  };
});

// #endregion
const ProfileRadarChart = () => {
  return (
    <RadarChart
      style={{
        backgroundColor:'#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: 1,
        height: '100%',
        maxHeight: '80vh',
        maxWidth: '500px',
        width: '100%',
      }}
      responsive
      outerRadius="80%"
      data={mockData}
      margin={{
        bottom: 20,
        left: 20,
        right: 20,
        top: 20,
      }}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <Radar dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
    </RadarChart>
  );
};

export default ProfileRadarChart;
