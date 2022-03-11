from socket import IP_DROP_MEMBERSHIP
from django.test import TestCase
from data_manager.models import Layer
from mida.utils import mdat_22Q1

# Create your tests here.
class MDAT22Q1Test(TestCase):
    fixtures = ['test_data.json',]

    def test_mdat_22_q1_migration(self):
        layers = Layer.objects.all()
        for foo in layers:
            self.assertTrue(isinstance(foo, Layer))
        # self.assertEqual(foo.__unicode__(), foo.name)
        # import ipdb; ipdb.set_trace()

        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity Low frequency:').count(), 3)
        self.assertEqual(
            [x.arcgis_layers for x in Layer.objects.filter(name__icontains='Sound sensitivity Low frequency:').order_by('arcgis_layers')],
            ['41','42','46']
        )
        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity Medium frequency:').count(), 3)
        self.assertEqual(
            [x.arcgis_layers for x in Layer.objects.filter(name__icontains='Sound sensitivity Medium frequency:').order_by('arcgis_layers')],
            ['49','50','54']
        )
        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity High frequency:').count(), 0)

        mdat_22Q1()

        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity Low frequency:').count(), 3)
        self.assertEqual(
            [x.arcgis_layers for x in Layer.objects.filter(name__icontains='Sound sensitivity Low frequency:').order_by('arcgis_layers')],
            ['49','50','54']
        )
        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity Medium frequency:').count(), 0)
        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity High frequency:').count(), 3)
        self.assertEqual(
            [x.arcgis_layers for x in Layer.objects.filter(name__icontains='Sound sensitivity High frequency:').order_by('arcgis_layers')],
            ['41','42','46']
        )

        mdat_22Q1(undo=True)

        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity Low frequency:').count(), 3)
        self.assertEqual(
            [x.arcgis_layers for x in Layer.objects.filter(name__icontains='Sound sensitivity Low frequency:').order_by('arcgis_layers')],
            ['41','42','46']
        )
        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity Medium frequency:').count(), 3)
        self.assertEqual(
            [x.arcgis_layers for x in Layer.objects.filter(name__icontains='Sound sensitivity Medium frequency:').order_by('arcgis_layers')],
            ['49','50','54']
        )
        self.assertEqual(Layer.objects.filter(name__icontains='Sound sensitivity High frequency:').count(), 0)



